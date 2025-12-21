import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

callHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

export const CallHistory = mongoose.model('CallHistory', callHistorySchema);
