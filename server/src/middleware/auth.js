const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log(`Auth middleware: Token received for path ${req.path}`);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Auth middleware: Token verified, user ID: ${decoded.id}`);

      // Find user by id and exclude password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log(`Auth middleware: User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log(`Auth middleware: User authenticated: ${req.user._id}`);
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    console.log(`Auth middleware: No token provided for path ${req.path}`);
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Optional auth middleware - doesn't require token but will use it if available
const optionalAuth = async (req, res, next) => {
  let token;

  // Check if token exists in the authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id and exclude password
      req.user = await User.findById(decoded.id).select('-password');
      console.log(`OptionalAuth middleware: User authenticated: ${req.user._id}`);
    } catch (error) {
      console.error('OptionalAuth middleware error:', error.message);
      // Don't return error, just continue without authentication
      req.user = null;
    }
  }
  
  next();
};

module.exports = { protect, optionalAuth }; 