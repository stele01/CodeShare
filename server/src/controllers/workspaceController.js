const Workspace = require('../models/Workspace');

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { title, code, language, isPublic } = req.body;

    const workspace = await Workspace.create({
      title: title || 'Untitled Workspace',
      code: code !== undefined ? code : '',
      language,
      isPublic: isPublic !== undefined ? isPublic : true,
      user: req.user._id
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all workspaces for a user
// @route   GET /api/workspaces
// @access  Private
const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ user: req.user._id })
      .sort({ updatedAt: -1 });

    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private/Public (depends on workspace visibility)
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('user', 'name');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Debug logging
    console.log(`Workspace access check: 
      - Workspace ID: ${workspace._id}
      - Is Public: ${workspace.isPublic}
      - Owner ID: ${workspace.user._id}
      - User authenticated: ${req.user ? 'Yes' : 'No'}
      - Request User ID: ${req.user ? req.user._id : 'None'}
    `);

    // Check if workspace is private and user is not the owner
    if (!workspace.isPublic) {
      if (!req.user) {
        return res.status(403).json({ 
          message: 'This workspace is private. Please log in to access it.',
          isPrivate: true 
        });
      }
      
      const workspaceOwnerId = workspace.user._id.toString();
      const requestUserId = req.user._id.toString();
      
      console.log(`Comparing IDs: "${workspaceOwnerId}" vs "${requestUserId}"`);
      
      if (workspaceOwnerId !== requestUserId) {
        return res.status(403).json({ 
          message: 'This workspace is private. Only the owner can access it.',
          isPrivate: true 
        });
      }
    }

    res.json(workspace);
  } catch (error) {
    console.error(`Error getting workspace ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private (owner only)
const updateWorkspace = async (req, res) => {
  try {
    const { title, code, language, isPublic } = req.body;

    let workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is workspace owner
    if (workspace.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this workspace' });
    }

    // Check if privacy changed from public to private
    const wasPublic = workspace.isPublic;
    const isNowPrivate = isPublic !== undefined && !isPublic && wasPublic;
    
    // Update fields
    workspace.title = title || workspace.title;
    // Handle code updates, including empty strings
    workspace.code = code !== undefined ? code : workspace.code;
    workspace.language = language || workspace.language;
    workspace.isPublic = isPublic !== undefined ? isPublic : workspace.isPublic;
    
    const updatedWorkspace = await workspace.save();

    // If we've changed from public to private, remove any share links
    if (isNowPrivate) {
      try {
        // Import the ShareLink model
        const ShareLink = require('../models/ShareLink');
        
        // Find and delete share links for this workspace
        const deletedLinks = await ShareLink.deleteMany({ workspaceId: workspace._id });
        
        console.log(`Deleted ${deletedLinks.deletedCount} share links for workspace ${workspace._id} due to privacy change`);
      } catch (error) {
        console.error('Error deleting share links after privacy change:', error);
        // Don't fail the request if share link deletion fails
      }
    }

    res.json(updatedWorkspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (owner only)
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is workspace owner
    if (workspace.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this workspace' });
    }

    await workspace.deleteOne();

    res.json({ message: 'Workspace removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get public workspaces
// @route   GET /api/workspaces/public
// @access  Public
const getPublicWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ isPublic: true })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('user', 'name');

    res.json(workspaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a temporary workspace for guest users
// @route   POST /api/workspaces/guest
// @access  Public
const createGuestWorkspace = async (req, res) => {
  try {
    const { title, code, language } = req.body;

    // Create a guest user ID that's consistent and recognizable
    const guestUserId = process.env.GUEST_USER_ID || '000000000000000000000000';

    const workspace = await Workspace.create({
      title: title || 'Guest Workspace',
      code: code !== undefined ? code : '',
      language,
      isPublic: true, // Guest workspaces are always public
      user: guestUserId
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating guest workspace:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getPublicWorkspaces,
  createGuestWorkspace
}; 