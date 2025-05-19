const Workspace = require('../models/Workspace');

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { title, code, language, isPublic } = req.body;

    const workspace = await Workspace.create({
      title: title || 'Untitled Workspace',
      code,
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

    // Check if workspace is private and user is not the owner
    if (!workspace.isPublic && (!req.user || workspace.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    res.json(workspace);
  } catch (error) {
    console.error(error);
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

    // Update fields
    workspace.title = title || workspace.title;
    workspace.code = code || workspace.code;
    workspace.language = language || workspace.language;
    workspace.isPublic = isPublic !== undefined ? isPublic : workspace.isPublic;
    
    const updatedWorkspace = await workspace.save();

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

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getPublicWorkspaces
}; 