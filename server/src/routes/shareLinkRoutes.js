const express = require('express');
const router = express.Router();
const { 
  createShareLink, 
  resolveShareLink
} = require('../controllers/shareLinkController');
const { optionalAuth } = require('../middleware/auth');

// Create a share link
router.post('/', optionalAuth, createShareLink);

// Resolve a share link
router.get('/:shortCode', resolveShareLink);

module.exports = router; 