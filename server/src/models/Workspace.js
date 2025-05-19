const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Workspace',
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Workspace must have code content'],
  },
  language: {
    type: String,
    required: [true, 'Programming language must be specified'],
    default: 'javascript'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
WorkspaceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Workspace', WorkspaceSchema); 