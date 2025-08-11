const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const router = express.Router();

// Initialize Firebase Admin (will be moved to config later)
// const serviceAccount = require('../config/firebase-service-account.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('phoneNumber').isMobilePhone('rw-RW'),
  body('nationalId').isLength({ min: 16, max: 16 }),
  body('district').isIn(['Gasabo', 'Kicukiro', 'Nyarugenge']),
  body('sector').trim().isLength({ min: 2 }),
  body('cell').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      nationalId,
      district,
      sector,
      cell
    } = req.body;

    // TODO: Check if user already exists
    // TODO: Hash password
    // TODO: Create user in Firebase
    // TODO: Generate JWT token
    // TODO: Send welcome SMS/email

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: 'temp-id',
        email,
        firstName,
        lastName,
        phoneNumber,
        district,
        sector,
        cell
      },
      token: 'temp-token'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // TODO: Find user by email
    // TODO: Verify password
    // TODO: Generate JWT token
    // TODO: Update last login

    res.json({
      message: 'Login successful',
      user: {
        id: 'temp-id',
        email,
        firstName: 'John',
        lastName: 'Doe'
      },
      token: 'temp-token'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    // TODO: Invalidate token (add to blacklist)
    // TODO: Update user last activity

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req, res) => {
  try {
    // TODO: Get user from token
    // TODO: Return user profile

    res.json({
      user: {
        id: 'temp-id',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+250788123456',
        district: 'Gasabo',
        sector: 'Kimironko',
        cell: 'Bibare'
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
