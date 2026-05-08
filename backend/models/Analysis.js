import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  status: { type: String, enum: ['Supports', 'Contradicts', 'Neutral'] }
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  contentSnippet: {
    type: String,
    required: true
  },
  inputType: {
    type: String,
    enum: ['text', 'url', 'pdf'],
    required: true
  },
  classification: {
    type: String,
    enum: ['Fake', 'Real', 'Misleading', 'Unverified'],
    required: true
  },
  score: {
    type: Number, // 0 to 100 where 100 is completely true
    required: true
  },
  confidence: {
    type: Number, // 0 to 100
    required: true
  },
  reasons: {
    type: [String],
    default: []
  },
  trustedSources: {
    type: [sourceSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
