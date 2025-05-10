const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize auth router
const router = express.Router();

// Sample users for demonstration
// In production, these would be stored in the database
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$CrxmIiUSRB.ixEr9oS1k2eBxD8CW7ZH/AkE7L7CRmxCnJ3AjTyX4y', // hashed 'password123'
    email: 'admin@trialsage.com',
    fullName: 'Admin User',
    role: 'admin',
    organization: 'TrialSage',
    lastLogin: null
  },
  {
    id: 2,
    username: 'demo',
    password: '$2a$10$CrxmIiUSRB.ixEr9oS1k2eBxD8CW7ZH/AkE7L7CRmxCnJ3AjTyX4y', // hashed 'password123'
    email: 'demo@trialsage.com',
    fullName: 'Demo User',
    role: 'user',
    organization: 'BioPharma Inc.',
    lastLogin: null
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // In a real implementation, fetch user from the database
    // For demonstration, we'll use the mock user data
    const user = mockUsers.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date().toISOString();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user data without sensitive information
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organization: user.organization,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
});

// Protected route to get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, fetch user from database using req.user.id
    const user = mockUsers.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return user data without sensitive information
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organization: user.organization,
      lastLogin: user.lastLogin
    };
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile' 
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication token is required' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
}

// Helper function to verify a token (for other server components)
function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = {
  router,
  authenticateToken,
  verifyToken
};