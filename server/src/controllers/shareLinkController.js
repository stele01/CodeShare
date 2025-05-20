const ShareLink = require('../models/ShareLink');
const Workspace = require('../models/Workspace');
const crypto = require('crypto');

// Generate a random short code for share links
const generateShortCode = () => {
  // Generate a 5 character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 5;
  let result = '';
  
  // Use crypto for better randomness
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

// @desc    Create a share link for a workspace
// @route   POST /api/share
// @access  Public (but checks workspace privacy)
const createShareLink = async (req, res) => {
  try {
    const { workspaceId } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }
    
    // Check if workspace exists and is public
    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    // Only allow sharing public workspaces
    if (!workspace.isPublic) {
      return res.status(403).json({ 
        message: 'Private workspaces cannot be shared via link',
        isPrivate: true 
      });
    }
    
    // Check if a share link already exists for this workspace
    let shareLink = await ShareLink.findOne({ workspaceId });
    
    if (shareLink) {
      // Return existing share link
      return res.status(200).json({
        shortCode: shareLink.shortCode,
        workspaceId: shareLink.workspaceId,
        createdAt: shareLink.createdAt
      });
    }
    
    // Generate a unique short code
    let shortCode;
    let isUnique = false;
    
    while (!isUnique) {
      shortCode = generateShortCode();
      // Check if the code already exists
      const existingLink = await ShareLink.findOne({ shortCode });
      if (!existingLink) {
        isUnique = true;
      }
    }
    
    // Create a new share link
    shareLink = await ShareLink.create({
      shortCode,
      workspaceId
    });
    
    res.status(201).json({
      shortCode: shareLink.shortCode,
      workspaceId: shareLink.workspaceId,
      createdAt: shareLink.createdAt
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Resolve a share link by short code
// @route   GET /api/share/:shortCode
// @access  Public
const resolveShareLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const shareLink = await ShareLink.findOne({ shortCode });
    
    if (!shareLink) {
      return res.status(404).json({ message: 'Share link not found or expired' });
    }
    
    // Check if the workspace still exists and is still public
    const workspace = await Workspace.findById(shareLink.workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    if (!workspace.isPublic) {
      return res.status(403).json({ 
        message: 'This workspace is private and cannot be accessed',
        isPrivate: true,
        owner: workspace.user.toString()
      });
    }
    
    // Return the workspace ID
    res.status(200).json({
      workspaceId: shareLink.workspaceId
    });
  } catch (error) {
    console.error('Error resolving share link:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createShareLink,
  resolveShareLink
}; 