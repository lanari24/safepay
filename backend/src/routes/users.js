const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req, res) => {
  try {
    // TODO: Get user from JWT token
    // TODO: Fetch complete user profile from database

    const userProfile = {
      id: 'user_001',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+250788123456',
      nationalId: '1234567890123456',
      location: {
        district: 'Gasabo',
        sector: 'Kimironko',
        cell: 'Bibare'
      },
      role: 'citizen',
      isVerified: true,
      joinedAt: '2024-07-01T00:00:00Z',
      lastActive: '2024-08-10T15:30:00Z',
      contributionStatus: {
        currentMonth: 'paid',
        totalContributed: 15000,
        nextDueDate: '2024-09-01T00:00:00Z'
      },
      emergencyContacts: [
        {
          name: 'Jane Doe',
          phoneNumber: '+250788654321',
          relationship: 'spouse'
        }
      ]
    };

    res.json({
      user: userProfile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phoneNumber').optional().isMobilePhone('rw-RW'),
  body('sector').optional().trim().isLength({ min: 2 }),
  body('cell').optional().trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // TODO: Get user from JWT token
    // TODO: Update user profile in database
    // TODO: Log profile changes

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...req.body,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/emergency-contacts
 * @desc    Add emergency contact
 * @access  Private
 */
router.post('/emergency-contacts', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('phoneNumber').isMobilePhone('rw-RW'),
  body('relationship').isIn(['spouse', 'parent', 'sibling', 'child', 'friend', 'colleague', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, phoneNumber, relationship } = req.body;

    // TODO: Get user from JWT token
    // TODO: Add emergency contact to database
    // TODO: Verify phone number if needed

    const emergencyContact = {
      id: `contact_${Date.now()}`,
      name,
      phoneNumber,
      relationship,
      createdAt: new Date().toISOString(),
      isVerified: false
    };

    res.status(201).json({
      message: 'Emergency contact added successfully',
      contact: emergencyContact
    });

  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      error: 'Failed to add emergency contact',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // TODO: Fetch notifications from database

    const notifications = [
      {
        id: 'notif_001',
        type: 'payment_reminder',
        title: 'Monthly Contribution Due',
        message: 'Your monthly Irondo contribution of 2000 RWF is due on September 1st.',
        isRead: false,
        createdAt: '2024-08-25T09:00:00Z'
      },
      {
        id: 'notif_002',
        type: 'security_alert',
        title: 'Security Update',
        message: 'New security measures implemented in your area. Check the forum for details.',
        isRead: true,
        createdAt: '2024-08-20T14:00:00Z'
      }
    ];

    const filteredNotifications = unreadOnly === 'true' 
      ? notifications.filter(n => !n.isRead)
      : notifications;

    res.json({
      notifications: filteredNotifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredNotifications.length
      }
    });

  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    // TODO: Get user from JWT token
    // TODO: Mark notification as read in database

    res.json({
      message: 'Notification marked as read',
      notificationId
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
