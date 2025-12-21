import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    ref: 'Visitor',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    default: 'User',
  },
  status: {
    type: String,
    default: 'active',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

noteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.dateCreated = ret.createdAt;
    return ret;
  },
});

export const Note = mongoose.model('Note', noteSchema);
