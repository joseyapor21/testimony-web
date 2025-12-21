import jwt from 'jsonwebtoken';
import { User, Department } from '../models/index.js';

// Department name this app is assigned to
const DEPARTMENT_NAME = 'Testimony Department';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    console.log('Found user:', user.email);

    const isMatch = user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check if user is in the Testimony Department
    const department = await Department.findOne({ name: DEPARTMENT_NAME });

    if (!department) {
      console.error('Department not found:', DEPARTMENT_NAME);
      return res.status(403).json({ error: 'Department not configured.' });
    }

    const userId = user._id.toString();
    const isAdmin = department.adminIds.includes(userId);
    const isMember = department.memberIds.includes(userId);

    if (!isAdmin && !isMember) {
      console.log('User not in department:', userId);
      return res.status(403).json({ error: 'You are not authorized to access this department.' });
    }

    console.log('User department access:', { isAdmin, isMember });

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: isAdmin,
        isMember: isMember,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name || '',
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getMe(req, res) {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
}
