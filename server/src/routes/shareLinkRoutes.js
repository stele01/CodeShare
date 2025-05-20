const express = require('express');
const router = express.Router();
const { 
  createShareLink, 
  resolveShareLink
} = require('../controllers/shareLinkController');

// Create a share link
router.post('/', createShareLink);

// Resolve a share link
router.get('/:shortCode', resolveShareLink);

module.exports = router; 