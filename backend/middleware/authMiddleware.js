import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // 1. Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Alternatively from cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }
    
    next();
  } catch (error) {
    console.error('JWT Error:', error.message);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Optional: Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is unauthorized`);
    }
    next();
  };
};

export { protect, authorize };