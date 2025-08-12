const { getFirestore } = require('../config/firebase');
const { collections } = require('../config/firebase');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.nationalId = data.nationalId;
    this.location = data.location || {};
    this.role = data.role || 'citizen';
    this.isVerified = data.isVerified || false;
    this.isActive = data.isActive || true;
    this.emergencyContacts = data.emergencyContacts || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastActive = data.lastActive;
  }

  // Convert to plain object for database storage
  toObject() {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      nationalId: this.nationalId,
      location: this.location,
      role: this.role,
      isVerified: this.isVerified,
      isActive: this.isActive,
      emergencyContacts: this.emergencyContacts,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastActive: this.lastActive
    };
  }

  // Static methods for database operations
  static async create(userData) {
    try {
      const db = getFirestore();
      const user = new User(userData);
      
      const docRef = await db.collection(collections.USERS).add(user.toObject());
      user.id = docRef.id;
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const db = getFirestore();
      const doc = await db.collection(collections.USERS).doc(userId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.USERS)
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findByPhoneNumber(phoneNumber) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.USERS)
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  static async findByNationalId(nationalId) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.USERS)
        .where('nationalId', '==', nationalId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error finding user by national ID:', error);
      throw error;
    }
  }

  static async findByDistrict(district, limit = 50) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection(collections.USERS)
        .where('location.district', '==', district)
        .where('isActive', '==', true)
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding users by district:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const db = getFirestore();
      this.updatedAt = new Date().toISOString();
      
      if (this.id) {
        await db.collection(collections.USERS).doc(this.id).update(this.toObject());
      } else {
        const docRef = await db.collection(collections.USERS).add(this.toObject());
        this.id = docRef.id;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete user without ID');
      }
      
      const db = getFirestore();
      await db.collection(collections.USERS).doc(this.id).delete();
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateLastActive() {
    try {
      this.lastActive = new Date().toISOString();
      await this.save();
    } catch (error) {
      console.error('Error updating last active:', error);
      throw error;
    }
  }

  async addEmergencyContact(contact) {
    try {
      this.emergencyContacts.push({
        id: `contact_${Date.now()}`,
        ...contact,
        createdAt: new Date().toISOString()
      });
      await this.save();
      return this.emergencyContacts[this.emergencyContacts.length - 1];
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  }

  async removeEmergencyContact(contactId) {
    try {
      this.emergencyContacts = this.emergencyContacts.filter(
        contact => contact.id !== contactId
      );
      await this.save();
      return true;
    } catch (error) {
      console.error('Error removing emergency contact:', error);
      throw error;
    }
  }

  // Validation methods
  static validateUserData(userData) {
    const errors = [];
    
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.push('Valid email is required');
    }
    
    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    
    if (!userData.lastName || userData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    
    if (!userData.phoneNumber || !/^\+250\d{9}$/.test(userData.phoneNumber)) {
      errors.push('Valid Rwanda phone number is required (+250XXXXXXXXX)');
    }
    
    if (!userData.nationalId || userData.nationalId.length !== 16) {
      errors.push('National ID must be 16 characters');
    }
    
    if (!userData.location || !userData.location.district) {
      errors.push('District is required');
    }
    
    return errors;
  }

  // Get user's full name
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin' || this.role === 'super_admin';
  }

  // Check if user is security agent
  isSecurityAgent() {
    return this.role === 'security_agent';
  }
}

module.exports = User;
