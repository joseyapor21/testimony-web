import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Test password - CHANGE THIS to your actual password
const TEST_PASSWORD = 'test123';

async function testPassword() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await mongoose.connection.db.collection('v5users').findOne({email: 'jose.gyapor@gmail.com'});

  console.log('=== Testing Password Verification ===');
  console.log('Email:', user.email);
  console.log('Stored hash:', user.password);
  console.log('Test password:', TEST_PASSWORD);
  console.log('');

  const storedPassword = user.password;

  // Format: sha256$salt$hash
  if (storedPassword.startsWith('sha256$')) {
    const parts = storedPassword.split('$');
    console.log('Hash format: sha256$salt$hash');
    console.log('Parts count:', parts.length);

    if (parts.length === 3) {
      const salt = parts[1];
      const storedHash = parts[2];

      console.log('Salt:', salt);
      console.log('Stored hash:', storedHash);

      const candidateHash = crypto.createHmac('sha256', salt).update(TEST_PASSWORD).digest('hex');
      console.log('Candidate hash:', candidateHash);
      console.log('Match:', candidateHash === storedHash);
    }
  }

  await mongoose.disconnect();
}

testPassword();
