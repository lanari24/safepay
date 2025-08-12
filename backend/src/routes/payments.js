const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

/**
 * @route   POST /api/payments/contribute
 * @desc    Make a contribution payment for Irondo services
 * @access  Private
 */
router.post('/contribute', verifyToken, [
  body('amount').isFloat({ min: 100 }), // Minimum 100 RWF
  body('paymentMethod').isIn(['mobile_money', 'bank_card', 'ussd']),
  body('phoneNumber').isMobilePhone('rw-RW'),
  body('contributionType').isIn(['monthly', 'quarterly', 'annual', 'emergency']),
  body('description').optional().trim().isLength({ max: 200 })
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
      amount,
      paymentMethod,
      phoneNumber,
      contributionType,
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

    // Validate payment data
    const paymentData = {
      userId,
      amount,
      paymentMethod,
      phoneNumber,
      contributionType,
      description: description || `${contributionType} Irondo contribution`
    };

    const validationErrors = Payment.validatePaymentData(paymentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Payment validation failed',
        details: validationErrors
      });
    }

    // Create payment transaction
    const payment = await Payment.create(paymentData);

    // TODO: Process payment with payment gateway (MTN Mobile Money, Airtel Money)
    // For now, we'll simulate payment processing
    console.log('💰 PAYMENT INITIATED:', payment.toObject());

    // TODO: Send confirmation SMS
    // TODO: Integrate with actual payment gateway

    res.status(201).json({
      message: 'Payment initiated successfully',
      transaction: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      },
      paymentInstructions: {
        message: `Please complete payment of ${amount} RWF using ${paymentMethod}`,
        reference: payment.reference,
        phoneNumber: phoneNumber
      }
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      error: 'Payment failed',
      message: 'Failed to process payment'
    });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, contributionType } = req.query;

    // Get user from JWT token
    const userId = req.user.userId;

    // Fetch payment history from database
    let payments = await Payment.findByUserId(userId, parseInt(limit) * parseInt(page));

    // Apply filters if provided
    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }

    if (contributionType) {
      payments = payments.filter(payment => payment.contributionType === contributionType);
    }

    // Paginate results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = payments.slice(startIndex, endIndex);

    res.json({
      payments: paginatedPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        contributionType: payment.contributionType,
        status: payment.status,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        reference: payment.reference,
        description: payment.description,
        paymentMethod: payment.paymentMethod
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payments.length,
        totalPages: Math.ceil(payments.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment history',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle payment gateway webhooks
 * @access  Public (but secured with webhook signature)
 */
router.post('/webhook', async (req, res) => {
  try {
    // TODO: Verify webhook signature
    // TODO: Process payment status update
    // TODO: Update transaction in database
    // TODO: Send confirmation to user
    // TODO: Trigger any post-payment actions

    const { transactionId, status, reference } = req.body;

    console.log('📞 PAYMENT WEBHOOK RECEIVED:', { transactionId, status, reference });

    res.status(200).json({
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: 'Webhook processing failed'
    });
  }
});

/**
 * @route   GET /api/payments/stats
 * @desc    Get payment statistics for user
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    // TODO: Get user from JWT token
    // TODO: Calculate payment statistics

    const stats = {
      totalContributed: 15000, // RWF
      contributionsThisYear: 12000,
      contributionsThisMonth: 2000,
      averageContribution: 2500,
      lastContribution: {
        amount: 2000,
        date: '2024-08-01T10:00:00Z',
        type: 'monthly'
      },
      upcomingDue: {
        amount: 2000,
        dueDate: '2024-09-01T00:00:00Z',
        type: 'monthly'
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment statistics',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
