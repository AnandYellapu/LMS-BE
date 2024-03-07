const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT secret is not configured properly' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Handle specific error cases without sending detailed messages to the client
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired. Please Login again' });
      }
      // For other errors, simply send a generic message
      return res.status(403).json({ message: 'Invalid token. refresh and Please Login again' });
    }
    req.user = user;
    next();
  });
};

// Middleware function to check user role
const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
  };
};

// Middleware function to get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.currentUser = user;
    next();
  } catch (err) {
    // Log the error without exposing details to the client
    console.error('Error in getCurrentUser middleware:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authenticateToken,
  checkRole,
  getCurrentUser,
};
