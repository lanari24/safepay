const { getFirestore } = require('../config/firebase');
const { collections } = require('../config/firebase');

class EmergencyAlert {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.location = data.location;
    this.emergencyType = data.emergencyType;
    this.description = data.description;
    this.status = data.status || 'active';
    this.priority = data.priority || 'medium';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.acknowledgedAt = data.acknowledgedAt;
    this.respondedAt = data.respondedAt;
    this.resolvedAt = data.resolvedAt;
    this.responderId = data.responderId;
    this.responderNotes = data.responderNotes;
    this.notifiedAgents = data.notifiedAgents || [];
    this.emergencyContacts = data.emergencyContacts || [];
    this.attachments = data.attachments || [];
  }

  toObject() {
    return {
      userId: this.userId,
      location: this.location,
      emergencyType: this.emergencyType,
      description: this.description,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      acknowledgedAt: this.acknowledgedAt,
      respondedAt: this.respondedAt,
      resolvedAt: this.resolvedAt,
      responderId: this.responderId,
      responderNotes: this.responderNotes,
      notifiedAgents: this.notifiedAgents,
      emergencyContacts: this.emergencyContacts,
      attachments: this.attachments
    };
  }

  static async create(alertData) {
    try {
      const db = getFirestore();
      const alert = new EmergencyAlert(alertData);
      
      const docRef = await db.collection(collections.EMERGENCY_ALERTS).add(alert.toObject());
      alert.id = docRef.id;
      
      return alert;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  static async findById(alertId) {
    try {
      const db = getFirestore();
      const doc = await db.collection(collections.EMERGENCY_ALERTS).doc(alertId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new EmergencyAlert({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding alert by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, limit = 50) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.EMERGENCY_ALERTS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new EmergencyAlert({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding alerts by user ID:', error);
      throw error;
    }
  }

  static async findByStatus(status, limit = 100) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.EMERGENCY_ALERTS)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new EmergencyAlert({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding alerts by status:', error);
      throw error;
    }
  }

  static async findActiveAlerts(limit = 50) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.EMERGENCY_ALERTS)
        .where('status', 'in', ['active', 'acknowledged', 'en_route'])
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new EmergencyAlert({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding active alerts:', error);
      throw error;
    }
  }

  static async findNearbyAlerts(latitude, longitude, radiusKm = 5, limit = 20) {
    try {
      const db = getFirestore();
      
      // Simple bounding box calculation (for more precise, use geohash)
      const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
      const lonDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
      
      const snapshot = await db.collection(collections.EMERGENCY_ALERTS)
        .where('location.latitude', '>=', latitude - latDelta)
        .where('location.latitude', '<=', latitude + latDelta)
        .where('status', 'in', ['active', 'acknowledged'])
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const alerts = snapshot.docs.map(doc => new EmergencyAlert({ id: doc.id, ...doc.data() }));
      
      // Filter by longitude and calculate actual distance
      return alerts.filter(alert => {
        const alertLon = alert.location.longitude;
        return alertLon >= longitude - lonDelta && alertLon <= longitude + lonDelta;
      });
    } catch (error) {
      console.error('Error finding nearby alerts:', error);
      throw error;
    }
  }

  static async getAlertStats(startDate = null, endDate = null) {
    try {
      const db = getFirestore();
      let query = db.collection(collections.EMERGENCY_ALERTS);
      
      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }
      
      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }
      
      const snapshot = await query.get();
      const alerts = snapshot.docs.map(doc => new EmergencyAlert({ id: doc.id, ...doc.data() }));
      
      const stats = {
        total: alerts.length,
        active: 0,
        resolved: 0,
        averageResponseTime: 0,
        byType: {},
        byPriority: {}
      };
      
      let totalResponseTime = 0;
      let resolvedCount = 0;
      
      alerts.forEach(alert => {
        // Count by status
        if (alert.status === 'active' || alert.status === 'acknowledged' || alert.status === 'en_route') {
          stats.active++;
        } else if (alert.status === 'resolved') {
          stats.resolved++;
          
          // Calculate response time
          if (alert.respondedAt) {
            const responseTime = new Date(alert.respondedAt) - new Date(alert.createdAt);
            totalResponseTime += responseTime;
            resolvedCount++;
          }
        }
        
        // Count by type
        if (!stats.byType[alert.emergencyType]) {
          stats.byType[alert.emergencyType] = 0;
        }
        stats.byType[alert.emergencyType]++;
        
        // Count by priority
        if (!stats.byPriority[alert.priority]) {
          stats.byPriority[alert.priority] = 0;
        }
        stats.byPriority[alert.priority]++;
      });
      
      // Calculate average response time in minutes
      if (resolvedCount > 0) {
        stats.averageResponseTime = Math.round((totalResponseTime / resolvedCount) / (1000 * 60));
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting alert stats:', error);
      throw error;
    }
  }

  async save() {
    try {
      const db = getFirestore();
      
      if (this.id) {
        await db.collection(collections.EMERGENCY_ALERTS).doc(this.id).update(this.toObject());
      } else {
        const docRef = await db.collection(collections.EMERGENCY_ALERTS).add(this.toObject());
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving emergency alert:', error);
      throw error;
    }
  }

  async acknowledge(responderId, notes = '') {
    try {
      this.status = 'acknowledged';
      this.acknowledgedAt = new Date().toISOString();
      this.responderId = responderId;
      if (notes) this.responderNotes = notes;
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  async markEnRoute(responderId, notes = '') {
    try {
      this.status = 'en_route';
      this.respondedAt = new Date().toISOString();
      this.responderId = responderId;
      if (notes) this.responderNotes = notes;
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error marking alert as en route:', error);
      throw error;
    }
  }

  async resolve(responderId, notes = '') {
    try {
      this.status = 'resolved';
      this.resolvedAt = new Date().toISOString();
      this.responderId = responderId;
      if (notes) this.responderNotes = notes;
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  async addNotifiedAgent(agentId) {
    try {
      if (!this.notifiedAgents.includes(agentId)) {
        this.notifiedAgents.push(agentId);
        await this.save();
      }
      return this;
    } catch (error) {
      console.error('Error adding notified agent:', error);
      throw error;
    }
  }

  // Validation
  static validateAlertData(alertData) {
    const errors = [];
    
    if (!alertData.userId) {
      errors.push('User ID is required');
    }
    
    if (!alertData.location || !alertData.location.latitude || !alertData.location.longitude) {
      errors.push('Valid location coordinates are required');
    }
    
    if (!alertData.emergencyType || !['medical', 'security', 'fire', 'general'].includes(alertData.emergencyType)) {
      errors.push('Valid emergency type is required');
    }
    
    if (alertData.location) {
      const { latitude, longitude } = alertData.location;
      if (latitude < -90 || latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      if (longitude < -180 || longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
    
    return errors;
  }

  // Helper methods
  isActive() {
    return ['active', 'acknowledged', 'en_route'].includes(this.status);
  }

  isResolved() {
    return this.status === 'resolved';
  }

  getResponseTime() {
    if (this.respondedAt && this.createdAt) {
      const responseTime = new Date(this.respondedAt) - new Date(this.createdAt);
      return Math.round(responseTime / (1000 * 60)); // in minutes
    }
    return null;
  }

  calculateDistance(latitude, longitude) {
    const R = 6371; // Earth's radius in km
    const dLat = (latitude - this.location.latitude) * Math.PI / 180;
    const dLon = (longitude - this.location.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.location.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }
}

module.exports = EmergencyAlert;
