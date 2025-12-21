import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSuperUser: {
    type: Boolean,
    default: false,
  },
  departments: {
    type: Array,
    default: [],
  },
  profile: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
}, {
  collection: 'v5users', // Use existing collection
});

// Hash password before saving (matching existing format: sha256$salt$hash)
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  // Only hash if it's a plain password (doesn't contain $ delimiter)
  if (!this.password.includes('$')) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(this.password).digest('hex');
    this.password = `sha256$${salt}$${hash}`;
  }
  next();
});

// Compare password method (supports multiple hash formats from existing system)
userSchema.methods.comparePassword = function(candidatePassword) {
  const storedPassword = this.password;

  // Format: sha256$salt$hash
  if (storedPassword.startsWith('sha256$')) {
    const parts = storedPassword.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const storedHash = parts[2];
      const candidateHash = crypto.createHmac('sha256', salt).update(candidatePassword).digest('hex');
      return candidateHash === storedHash;
    }
  }

  // Format: pbkdf2:sha256$salt$hash
  if (storedPassword.startsWith('pbkdf2:sha256$')) {
    const parts = storedPassword.replace('pbkdf2:sha256$', '').split('$');
    if (parts.length === 2) {
      const salt = parts[0];
      const storedHash = parts[1];
      const candidateHash = crypto.pbkdf2Sync(candidatePassword, salt, 1000, 32, 'sha256').toString('hex');
      return candidateHash === storedHash;
    }
  }

  // Plain text comparison (fallback)
  if (storedPassword === candidatePassword) {
    return true;
  }

  // Simple SHA256 hash comparison
  const simpleHash = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return simpleHash === storedPassword;
};

export const User = mongoose.model('User', userSchema);
