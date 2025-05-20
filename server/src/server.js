require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Middleware
app.use(express.json());
app.use(cors());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 