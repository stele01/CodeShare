const express = require('express');
const router = express.Router();
const { 
  createWorkspace, 
  getUserWorkspaces, 
  getWorkspaceById, 
  updateWorkspace, 
  deleteWorkspace, 
  getPublicWorkspaces,
  createGuestWorkspace
} = require('../controllers/workspaceController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/public', getPublicWorkspaces);
router.post('/guest', createGuestWorkspace);

// Semi-protected route (handles public/private access internally)
router.get('/:id', optionalAuth, getWorkspaceById);

// Protected routes
router.post('/', protect, createWorkspace);
router.get('/', protect, getUserWorkspaces);
router.put('/:id', protect, updateWorkspace);
router.delete('/:id', protect, deleteWorkspace);

module.exports = router; 