const jwt = require('jsonwebtoken');
const { verifyIdToken } = require('../config/firebase');

/**
 * Middleware to verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware to verify Firebase ID token
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      phoneNumber: decodedToken.phone_number
    };
    
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({
      error: 'Access denied',
      message: 'Invalid Firebase token'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    // TODO: Check user role in database
    const userRole = req.user?.role || 'citizen';
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'Admin privileges required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      error: 'Authorization check failed',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if user is a security agent
 */
const requireSecurityAgent = async (req, res, next) => {
  try {
    // TODO: Check user role in database
    const userRole = req.user?.role || 'citizen';
    
    if (userRole !== 'security_agent' && userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'Security agent privileges required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Security agent check error:', error);
    return res.status(500).json({
      error: 'Authorization check failed',
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if user is verified
 */
const requireVerified = async (req, res, next) => {
  try {
    // TODO: Check user verification status in database
    const isVerified = req.user?.isVerified || false;
    
    if (!isVerified) {
      return res.status(403).json({
        error: 'Account not verified',
        message: 'Please verify your account to access this feature'
      });
    }
    
    next();
  } catch (error) {
    console.error('Verification check error:', error);
    return res.status(500).json({
      error: 'Verification check failed',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  verifyToken,
  verifyFirebaseToken,
  requireAdmin,
  requireSecurityAgent,
  requireVerified
};
