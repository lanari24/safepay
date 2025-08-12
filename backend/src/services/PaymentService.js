const axios = require('axios');
const Payment = require('../models/Payment');

class PaymentService {
  constructor() {
    this.mtnApiUrl = process.env.MTN_API_URL || 'https://sandbox.momodeveloper.mtn.com';
    this.airtelApiUrl = process.env.AIRTEL_API_URL || 'https://openapi.airtel.africa';
    this.mtnApiKey = process.env.MTN_API_KEY;
    this.airtelApiKey = process.env.AIRTEL_API_KEY;
  }

  /**
   * Process payment based on payment method
   */
  async processPayment(payment) {
    try {
      switch (payment.paymentMethod) {
        case 'mobile_money':
          return await this.processMobileMoneyPayment(payment);
        case 'bank_card':
          return await this.processBankCardPayment(payment);
        case 'ussd':
          return await this.processUSSDPayment(payment);
        default:
          throw new Error('Unsupported payment method');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      await payment.markAsFailed(error.message);
      throw error;
    }
  }

  /**
   * Process mobile money payment (MTN/Airtel)
   */
  async processMobileMoneyPayment(payment) {
    try {
      // Mark payment as processing
      await payment.markAsProcessing();

      // Determine provider based on phone number
      const provider = this.detectMobileProvider(payment.phoneNumber);
      
      let result;
      if (provider === 'MTN') {
        result = await this.processMTNPayment(payment);
      } else if (provider === 'Airtel') {
        result = await this.processAirtelPayment(payment);
      } else {
        throw new Error('Unsupported mobile money provider');
      }

      if (result.success) {
        await payment.markAsCompleted(result.transactionId, result);
        return { success: true, transactionId: result.transactionId };
      } else {
        await payment.markAsFailed(result.error, result);
        return { success: false, error: result.error };
      }
    } catch (error) {
      await payment.markAsFailed(error.message);
      throw error;
    }
  }

  /**
   * Process MTN Mobile Money payment
   */
  async processMTNPayment(payment) {
    try {
      // This is a simplified implementation
      // In production, you would integrate with MTN MoMo API
      
      const requestData = {
        amount: payment.amount,
        currency: payment.currency,
        externalId: payment.reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: payment.phoneNumber.replace('+250', '250')
        },
        payerMessage: payment.description,
        payeeNote: `Rwanda Safe Pay - ${payment.contributionType} contribution`
      };

      // Simulate API call (replace with actual MTN API integration)
      console.log('Processing MTN payment:', requestData);
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: `MTN_${Date.now()}`,
          status: 'SUCCESSFUL',
          message: 'Payment processed successfully'
        };
      } else {
        return {
          success: false,
          error: 'Insufficient balance or payment declined',
          status: 'FAILED'
        };
      }
    } catch (error) {
      console.error('MTN payment error:', error);
      return {
        success: false,
        error: error.message,
        status: 'FAILED'
      };
    }
  }

  /**
   * Process Airtel Money payment
   */
  async processAirtelPayment(payment) {
    try {
      // This is a simplified implementation
      // In production, you would integrate with Airtel Money API
      
      const requestData = {
        reference: payment.reference,
        subscriber: {
          country: 'RW',
          currency: payment.currency,
          msisdn: payment.phoneNumber.replace('+250', '250')
        },
        transaction: {
          amount: payment.amount,
          country: 'RW',
          currency: payment.currency,
          id: payment.reference
        }
      };

      // Simulate API call (replace with actual Airtel API integration)
      console.log('Processing Airtel payment:', requestData);
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: `AIRTEL_${Date.now()}`,
          status: 'TS',
          message: 'Payment processed successfully'
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed or insufficient balance',
          status: 'TF'
        };
      }
    } catch (error) {
      console.error('Airtel payment error:', error);
      return {
        success: false,
        error: error.message,
        status: 'TF'
      };
    }
  }

  /**
   * Process bank card payment
   */
  async processBankCardPayment(payment) {
    try {
      // This would integrate with a bank card processor
      // For now, we'll simulate the process
      
      await payment.markAsProcessing();
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isSuccess = Math.random() > 0.05; // 95% success rate for simulation
      
      if (isSuccess) {
        const transactionId = `CARD_${Date.now()}`;
        await payment.markAsCompleted(transactionId);
        return { success: true, transactionId };
      } else {
        await payment.markAsFailed('Card payment declined');
        return { success: false, error: 'Card payment declined' };
      }
    } catch (error) {
      await payment.markAsFailed(error.message);
      throw error;
    }
  }

  /**
   * Process USSD payment
   */
  async processUSSDPayment(payment) {
    try {
      // USSD payments are typically initiated by the user
      // This would generate a USSD code for the user to dial
      
      const ussdCode = this.generateUSSDCode(payment);
      
      // Keep payment as pending until user completes USSD transaction
      return {
        success: true,
        ussdCode,
        message: `Dial ${ussdCode} to complete your payment`,
        instructions: [
          `Dial ${ussdCode}`,
          'Follow the prompts on your phone',
          'Enter your mobile money PIN when requested',
          'You will receive a confirmation SMS'
        ]
      };
    } catch (error) {
      await payment.markAsFailed(error.message);
      throw error;
    }
  }

  /**
   * Detect mobile money provider based on phone number
   */
  detectMobileProvider(phoneNumber) {
    const number = phoneNumber.replace('+250', '');
    
    // MTN Rwanda prefixes: 78, 79
    if (number.startsWith('78') || number.startsWith('79')) {
      return 'MTN';
    }
    
    // Airtel Rwanda prefixes: 73, 75
    if (number.startsWith('73') || number.startsWith('75')) {
      return 'Airtel';
    }
    
    return 'Unknown';
  }

  /**
   * Generate USSD code for payment
   */
  generateUSSDCode(payment) {
    const provider = this.detectMobileProvider(payment.phoneNumber);
    
    if (provider === 'MTN') {
      return '*182*8*1#'; // MTN MoMo USSD code (example)
    } else if (provider === 'Airtel') {
      return '*500#'; // Airtel Money USSD code (example)
    }
    
    return '*182#'; // Default USSD code
  }

  /**
   * Handle payment webhook/callback
   */
  async handlePaymentCallback(callbackData) {
    try {
      const { reference, status, transactionId, error } = callbackData;
      
      const payment = await Payment.findByReference(reference);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (status === 'SUCCESS' || status === 'SUCCESSFUL' || status === 'TS') {
        await payment.markAsCompleted(transactionId, callbackData);
        
        // TODO: Send confirmation SMS/email to user
        // TODO: Update user contribution records
        
        return { success: true, payment };
      } else {
        await payment.markAsFailed(error || 'Payment failed', callbackData);
        return { success: false, payment, error };
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        id: payment.id,
        reference: payment.reference,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        failedAt: payment.failedAt,
        failureReason: payment.failureReason
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
