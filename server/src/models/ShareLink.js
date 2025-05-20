const mongoose = require('mongoose');

const ShareLinkSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // Links expire after 30 days
  }
});

module.exports = mongoose.model('ShareLink', ShareLinkSchema); 