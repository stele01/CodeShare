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
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index: remove at the moment of expiration
  }
});

module.exports = mongoose.model('ShareLink', ShareLinkSchema); 