const express = require('express');
const { body, validationResult } = require('express-validator');
const EmergencyAlert = require('../models/EmergencyAlert');
const User = require('../models/User');
const { verifyToken, requireSecurityAgent } = require('../middleware/auth');
const router = express.Router();

/**
 * @route   POST /api/emergency/sos
 * @desc    Trigger SOS emergency alert
 * @access  Private
 */
router.post('/sos', verifyToken, [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('emergencyType').isIn(['medical', 'security', 'fire', 'general']),
  body('description').optional().trim().isLength({ max: 500 })
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
      latitude,
      longitude,
      emergencyType,
      description
    } = req.body;

    // Get user from JWT token
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Create emergency alert data
    const alertData = {
      userId,
      location: {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        address: `${user.location.sector}, ${user.location.district}` // Approximate address
      },
      emergencyType,
      description: description || '',
      priority: emergencyType === 'medical' ? 'high' : 'medium'
    };

    // Validate alert data
    const validationErrors = EmergencyAlert.validateAlertData(alertData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Alert validation failed',
        details: validationErrors
      });
    }

    // Create emergency alert
    const emergencyAlert = await EmergencyAlert.create(alertData);

    // Find nearby security agents within 2km radius
    const nearbyAgents = await User.findByDistrict(user.location.district);
    const securityAgents = nearbyAgents.filter(agent => agent.role === 'security_agent');

    // TODO: Send push notifications to nearby agents
    // TODO: Send SMS alerts to emergency contacts
    // TODO: Integrate with real-time notification system

    console.log('🚨 EMERGENCY ALERT TRIGGERED:', emergencyAlert.toObject());

    res.status(201).json({
      message: 'Emergency alert sent successfully',
      alertId: emergencyAlert.id,
      status: emergencyAlert.status,
      location: emergencyAlert.location,
      estimatedResponseTime: '5-10 minutes',
      nearbyAgents: securityAgents.length,
      createdAt: emergencyAlert.createdAt
    });

  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({
      error: 'Emergency alert failed',
      message: 'Failed to send emergency alert'
    });
  }
});

/**
 * @route   GET /api/emergency/alerts
 * @desc    Get user's emergency alerts history
 * @access  Private
 */
router.get('/alerts', async (req, res) => {
  try {
    // TODO: Get user from JWT token
    // TODO: Fetch user's emergency alerts from database

    const alerts = [
      {
        id: 'sos_1691234567890',
        emergencyType: 'security',
        location: {
          latitude: -1.9441,
          longitude: 30.0619
        },
        status: 'resolved',
        createdAt: '2024-08-05T14:30:00Z',
        respondedAt: '2024-08-05T14:35:00Z',
        responseTime: '5 minutes'
      }
    ];

    res.json({
      alerts,
      total: alerts.length
    });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/emergency/respond
 * @desc    Security agent responds to emergency alert
 * @access  Private (Security Agents only)
 */
router.post('/respond', [
  body('alertId').trim().isLength({ min: 1 }),
  body('response').isIn(['acknowledged', 'en_route', 'arrived', 'resolved']),
  body('notes').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { alertId, response, notes } = req.body;

    // TODO: Verify user is a security agent
    // TODO: Update alert status in database
    // TODO: Notify the user who triggered the alert
    // TODO: Log response activity

    res.json({
      message: 'Response recorded successfully',
      alertId,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Emergency response error:', error);
    res.status(500).json({
      error: 'Response failed',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/emergency/nearby-agents
 * @desc    Get nearby security agents for location
 * @access  Private
 */
router.get('/nearby-agents', async (req, res) => {
  try {
    const { latitude, longitude, radius = 2000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Latitude and longitude are required'
      });
    }

    // TODO: Query database for nearby agents
    // TODO: Calculate distances
    // TODO: Filter by availability status

    const nearbyAgents = [
      {
        id: 'agent_001',
        name: 'Jean Baptiste',
        distance: 850, // meters
        status: 'available',
        responseTime: '3-5 minutes'
      },
      {
        id: 'agent_002',
        name: 'Marie Claire',
        distance: 1200,
        status: 'available',
        responseTime: '5-7 minutes'
      }
    ];

    res.json({
      agents: nearbyAgents,
      total: nearbyAgents.length,
      searchRadius: radius
    });

  } catch (error) {
    console.error('Nearby agents error:', error);
    res.status(500).json({
      error: 'Failed to find nearby agents',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
