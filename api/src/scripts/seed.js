import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/index.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@testimony.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const admin = new User({
        email: 'admin@testimony.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created:');
      console.log('  Email: admin@testimony.com');
      console.log('  Password: admin123');
    }

    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
