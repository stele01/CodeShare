require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const jwt = require('jsonwebtoken');

// Route files
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const shareLinkRoutes = require('./routes/shareLinkRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Zameni sa stvarnim domenom
      : ['http://localhost:3000', 'http://localhost:5173'], // Development domene
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific workspace room
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace-${workspaceId}`);
    console.log(`User ${socket.id} joined workspace-${workspaceId}`);
  });

  // Handle code updates from clients
  socket.on('code-update', ({ workspaceId, code, language, title, access }) => {
    console.log(`Code update received for workspace-${workspaceId}`, {
      codeLength: code !== undefined ? code.length : 'undefined',
      isCodeEmpty: code === ''
    });

    // Ensure code is properly sent even if empty
    const updateData = {
      code: code !== undefined ? code : '',
      language,
      title,
      access
    };

    // Broadcast the update to all clients in the same workspace room except sender
    socket.to(`workspace-${workspaceId}`).emit('code-updated', updateData);

    // Save the changes to the database
    saveWorkspaceChanges(workspaceId, updateData);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Function to save workspace changes to the database
const saveWorkspaceChanges = async (workspaceId, data) => {
  try {
    // Only attempt to save if we have a valid workspaceId
    if (!workspaceId || workspaceId === 'undefined') return;

    const Workspace = require('./models/Workspace');
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      console.log(`Workspace not found: ${workspaceId}`);
      return;
    }

    // Update workspace data
    // Ensure code is treated as empty string if it's null or undefined
    if (data.code !== undefined) {
      workspace.code = data.code === null ? '' : data.code;
    }
    if (data.language !== undefined) workspace.language = data.language;
    if (data.title !== undefined) workspace.title = data.title;
    if (data.access !== undefined) workspace.isPublic = data.access === 'Public';

    await workspace.save();
    console.log(`Workspace ${workspaceId} auto-saved`);
  } catch (error) {
    console.error('Error auto-saving workspace:', error);
  }
};

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100, // maksimalno 100 zahteva po IP adresi
  message: {
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 5, // maksimalno 5 pokušaja login/register po IP adresi
  message: {
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(limiter); // Apply rate limiting to all routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Zameni sa stvarnim domenom
    : ['http://localhost:3000', 'http://localhost:5173'], // Development domene
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware for authentication
app.use((req, res, next) => {
  // Log the authorization header for workspace routes
  if (req.path.startsWith('/api/workspaces/') && req.headers.authorization) {
    console.log(`Request to ${req.path} with Authorization header present`);

    // Try to decode the token to check if it's valid
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Token valid for user: ${decoded.id}`);
    } catch (error) {
      console.log(`Invalid token provided: ${error.message}`);
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/share', shareLinkRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CodeShare API' });
});

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen for Socket.IO
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 