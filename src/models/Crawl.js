import mongoose from 'mongoose';

const crawlSchema = new mongoose.Schema({
  crawl_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  cep_start: {
    type: String,
    required: true
  },
  cep_end: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  processed: {
    type: Number,
    default: 0
  },
  successes: {
    type: Number,
    default: 0
  },
  errors: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'finished', 'failed'],
    default: 'pending',
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

crawlSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export const Crawl = mongoose.model('Crawl', crawlSchema);