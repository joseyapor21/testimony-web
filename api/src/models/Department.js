import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  adminIds: [{
    type: String,
  }],
  memberIds: [{
    type: String,
  }],
  metadata: {
    createdAt: String,
    updatedAt: String,
  },
}, {
  collection: 'v5departments',
});

export const Department = mongoose.model('Department', departmentSchema);
