const { getFirestore } = require('../config/firebase');
const { collections } = require('../config/firebase');

class Payment {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.amount = data.amount;
    this.currency = data.currency || 'RWF';
    this.paymentMethod = data.paymentMethod;
    this.phoneNumber = data.phoneNumber;
    this.contributionType = data.contributionType;
    this.description = data.description;
    this.status = data.status || 'pending';
    this.reference = data.reference;
    this.externalReference = data.externalReference;
    this.gatewayResponse = data.gatewayResponse;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.processedAt = data.processedAt;
    this.failedAt = data.failedAt;
    this.failureReason = data.failureReason;
  }

  toObject() {
    return {
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      phoneNumber: this.phoneNumber,
      contributionType: this.contributionType,
      description: this.description,
      status: this.status,
      reference: this.reference,
      externalReference: this.externalReference,
      gatewayResponse: this.gatewayResponse,
      createdAt: this.createdAt,
      processedAt: this.processedAt,
      failedAt: this.failedAt,
      failureReason: this.failureReason
    };
  }

  static async create(paymentData) {
    try {
      const db = getFirestore();
      const payment = new Payment({
        ...paymentData,
        reference: `SP${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      });
      
      const docRef = await db.collection(collections.PAYMENTS).add(payment.toObject());
      payment.id = docRef.id;
      
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  static async findById(paymentId) {
    try {
      const db = getFirestore();
      const doc = await db.collection(collections.PAYMENTS).doc(paymentId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new Payment({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      throw error;
    }
  }

  static async findByReference(reference) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.PAYMENTS)
        .where('reference', '==', reference)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new Payment({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding payment by reference:', error);
      throw error;
    }
  }

  static async findByUserId(userId, limit = 50) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.PAYMENTS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding payments by user ID:', error);
      throw error;
    }
  }

  static async findByStatus(status, limit = 100) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.PAYMENTS)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding payments by status:', error);
      throw error;
    }
  }

  static async findByDateRange(startDate, endDate, limit = 1000) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.PAYMENTS)
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding payments by date range:', error);
      throw error;
    }
  }

  static async getPaymentStats(userId = null, startDate = null, endDate = null) {
    try {
      const db = getFirestore();
      let query = db.collection(collections.PAYMENTS);
      
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      
      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }
      
      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }
      
      const snapshot = await query.get();
      const payments = snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
      
      const stats = {
        total: payments.length,
        totalAmount: 0,
        successful: 0,
        pending: 0,
        failed: 0,
        byContributionType: {},
        byPaymentMethod: {}
      };
      
      payments.forEach(payment => {
        if (payment.status === 'completed') {
          stats.totalAmount += payment.amount;
          stats.successful++;
        } else if (payment.status === 'pending') {
          stats.pending++;
        } else if (payment.status === 'failed') {
          stats.failed++;
        }
        
        // Count by contribution type
        if (!stats.byContributionType[payment.contributionType]) {
          stats.byContributionType[payment.contributionType] = 0;
        }
        stats.byContributionType[payment.contributionType]++;
        
        // Count by payment method
        if (!stats.byPaymentMethod[payment.paymentMethod]) {
          stats.byPaymentMethod[payment.paymentMethod] = 0;
        }
        stats.byPaymentMethod[payment.paymentMethod]++;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  async save() {
    try {
      const db = getFirestore();
      
      if (this.id) {
        await db.collection(collections.PAYMENTS).doc(this.id).update(this.toObject());
      } else {
        const docRef = await db.collection(collections.PAYMENTS).add(this.toObject());
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving payment:', error);
      throw error;
    }
  }

  async markAsCompleted(externalReference = null, gatewayResponse = null) {
    try {
      this.status = 'completed';
      this.processedAt = new Date().toISOString();
      if (externalReference) this.externalReference = externalReference;
      if (gatewayResponse) this.gatewayResponse = gatewayResponse;
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error marking payment as completed:', error);
      throw error;
    }
  }

  async markAsFailed(reason, gatewayResponse = null) {
    try {
      this.status = 'failed';
      this.failedAt = new Date().toISOString();
      this.failureReason = reason;
      if (gatewayResponse) this.gatewayResponse = gatewayResponse;
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error marking payment as failed:', error);
      throw error;
    }
  }

  async markAsProcessing() {
    try {
      this.status = 'processing';
      await this.save();
      return this;
    } catch (error) {
      console.error('Error marking payment as processing:', error);
      throw error;
    }
  }

  // Validation
  static validatePaymentData(paymentData) {
    const errors = [];
    
    if (!paymentData.userId) {
      errors.push('User ID is required');
    }
    
    if (!paymentData.amount || paymentData.amount < 100) {
      errors.push('Amount must be at least 100 RWF');
    }
    
    if (!paymentData.paymentMethod || !['mobile_money', 'bank_card', 'ussd'].includes(paymentData.paymentMethod)) {
      errors.push('Valid payment method is required');
    }
    
    if (!paymentData.phoneNumber || !/^\+250\d{9}$/.test(paymentData.phoneNumber)) {
      errors.push('Valid Rwanda phone number is required');
    }
    
    if (!paymentData.contributionType || !['monthly', 'quarterly', 'annual', 'emergency'].includes(paymentData.contributionType)) {
      errors.push('Valid contribution type is required');
    }
    
    return errors;
  }

  // Helper methods
  isCompleted() {
    return this.status === 'completed';
  }

  isPending() {
    return this.status === 'pending';
  }

  isFailed() {
    return this.status === 'failed';
  }

  isProcessing() {
    return this.status === 'processing';
  }

  getFormattedAmount() {
    return `${this.amount.toLocaleString()} ${this.currency}`;
  }
}

module.exports = Payment;
