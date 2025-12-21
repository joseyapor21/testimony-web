import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

async function debugAuth() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await mongoose.connection.db.collection('v5users').findOne({email: 'jose.gyapor@gmail.com'});

  console.log('=== User found ===');
  console.log('Email:', user.email);
  console.log('Name:', user.name);
  console.log('Password hash:', user.password);
  console.log('');

  const storedPassword = user.password;
  const parts = storedPassword.split('$');
  console.log('=== Hash Analysis ===');
  console.log('Number of parts:', parts.length);
  console.log('Parts:', parts);

  await mongoose.disconnect();
}

debugAuth();
