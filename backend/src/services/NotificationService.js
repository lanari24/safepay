const admin = require('firebase-admin');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.smsApiUrl = process.env.SMS_API_URL;
    this.smsApiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'SAFEPAY';
  }

  /**
   * Send emergency alert notifications to nearby security agents
   */
  async notifySecurityAgents(emergencyAlert, nearbyAgents) {
    try {
      const notifications = [];
      
      for (const agent of nearbyAgents) {
        if (agent.role === 'security_agent') {
          // Send push notification
          const pushNotification = await this.sendPushNotification(agent.id, {
            title: '🚨 Emergency Alert',
            body: `${emergencyAlert.emergencyType.toUpperCase()} emergency in ${emergencyAlert.location.address}`,
            data: {
              type: 'emergency_alert',
              alertId: emergencyAlert.id,
              emergencyType: emergencyAlert.emergencyType,
              latitude: emergencyAlert.location.latitude.toString(),
              longitude: emergencyAlert.location.longitude.toString(),
              priority: emergencyAlert.priority
            }
          });

          // Send SMS notification
          const smsNotification = await this.sendSMS(agent.phoneNumber, 
            `EMERGENCY ALERT: ${emergencyAlert.emergencyType.toUpperCase()} at ${emergencyAlert.location.address}. ` +
            `Location: ${emergencyAlert.location.latitude}, ${emergencyAlert.location.longitude}. ` +
            `Respond immediately. Alert ID: ${emergencyAlert.id}`
          );

          notifications.push({
            agentId: agent.id,
            pushSent: pushNotification.success,
            smsSent: smsNotification.success
          });

          // Add agent to notified list
          await emergencyAlert.addNotifiedAgent(agent.id);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error notifying security agents:', error);
      throw error;
    }
  }

  /**
   * Send emergency alert to user's emergency contacts
   */
  async notifyEmergencyContacts(user, emergencyAlert) {
    try {
      const notifications = [];
      
      for (const contact of user.emergencyContacts) {
        const message = `EMERGENCY: ${user.getFullName()} has triggered an emergency alert. ` +
          `Type: ${emergencyAlert.emergencyType.toUpperCase()}. ` +
          `Location: ${emergencyAlert.location.address}. ` +
          `Time: ${new Date(emergencyAlert.createdAt).toLocaleString()}. ` +
          `Emergency services have been notified.`;

        const smsResult = await this.sendSMS(contact.phoneNumber, message);
        
        notifications.push({
          contactId: contact.id,
          contactName: contact.name,
          phoneNumber: contact.phoneNumber,
          sent: smsResult.success,
          error: smsResult.error
        });
      }

      return notifications;
    } catch (error) {
      console.error('Error notifying emergency contacts:', error);
      throw error;
    }
  }

  /**
   * Send push notification using Firebase Cloud Messaging
   */
  async sendPushNotification(userId, notification) {
    try {
      // In a real implementation, you would store FCM tokens for each user
      // For now, we'll simulate the notification
      
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        topic: `user_${userId}` // Or use specific device tokens
      };

      // Simulate FCM send
      console.log('Sending push notification:', message);
      
      // In production, use:
      // const response = await admin.messaging().send(message);
      
      return {
        success: true,
        messageId: `fcm_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber, message) {
    try {
      // This is a simplified SMS implementation
      // In production, integrate with SMS gateway (e.g., Twilio, Africa's Talking)
      
      const smsData = {
        to: phoneNumber,
        message: message,
        from: this.senderId
      };

      // Simulate SMS sending
      console.log('Sending SMS:', smsData);
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.05; // 95% success rate
      
      if (isSuccess) {
        return {
          success: true,
          messageId: `sms_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: 'SMS delivery failed'
        };
      }
    } catch (error) {
      console.error('SMS error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(user, payment) {
    try {
      const message = `Payment Confirmed! ` +
        `Amount: ${payment.getFormattedAmount()} ` +
        `Type: ${payment.contributionType} ` +
        `Reference: ${payment.reference} ` +
        `Date: ${new Date(payment.processedAt).toLocaleDateString()} ` +
        `Thank you for your contribution to community safety.`;

      const smsResult = await this.sendSMS(user.phoneNumber, message);
      
      // Also send push notification if available
      const pushResult = await this.sendPushNotification(user.id, {
        title: '💰 Payment Confirmed',
        body: `Your ${payment.contributionType} contribution of ${payment.getFormattedAmount()} has been processed successfully.`,
        data: {
          type: 'payment_confirmation',
          paymentId: payment.id,
          reference: payment.reference,
          amount: payment.amount.toString()
        }
      });

      return {
        sms: smsResult,
        push: pushResult
      };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminder(user, dueDate, amount, contributionType) {
    try {
      const message = `Payment Reminder: ` +
        `Your ${contributionType} Irondo contribution of ${amount} RWF is due on ${dueDate}. ` +
        `Please make your payment to continue supporting community safety. ` +
        `Use Rwanda Safe Pay app or dial *182# to pay.`;

      const smsResult = await this.sendSMS(user.phoneNumber, message);
      
      const pushResult = await this.sendPushNotification(user.id, {
        title: '📅 Payment Reminder',
        body: `Your ${contributionType} contribution of ${amount} RWF is due on ${dueDate}`,
        data: {
          type: 'payment_reminder',
          amount: amount.toString(),
          contributionType,
          dueDate
        }
      });

      return {
        sms: smsResult,
        push: pushResult
      };
    } catch (error) {
      console.error('Payment reminder error:', error);
      throw error;
    }
  }

  /**
   * Send forum post notification for urgent posts
   */
  async sendForumNotification(post, targetUsers) {
    try {
      const notifications = [];
      
      for (const user of targetUsers) {
        const pushResult = await this.sendPushNotification(user.id, {
          title: post.isUrgent ? '🚨 Urgent Community Update' : '💬 New Community Post',
          body: post.title,
          data: {
            type: 'forum_post',
            postId: post.id,
            category: post.category,
            isUrgent: post.isUrgent.toString()
          }
        });

        notifications.push({
          userId: user.id,
          sent: pushResult.success
        });
      }

      return notifications;
    } catch (error) {
      console.error('Forum notification error:', error);
      throw error;
    }
  }

  /**
   * Send emergency alert status update
   */
  async sendAlertStatusUpdate(user, alert, status, responderName = null) {
    try {
      let message = `Emergency Alert Update: `;
      
      switch (status) {
        case 'acknowledged':
          message += `Your emergency alert has been acknowledged by ${responderName || 'security agent'}. Help is on the way.`;
          break;
        case 'en_route':
          message += `Security agent ${responderName || ''} is en route to your location. Stay safe.`;
          break;
        case 'resolved':
          message += `Your emergency alert has been resolved. Thank you for using Rwanda Safe Pay emergency services.`;
          break;
        default:
          message += `Status updated to ${status}.`;
      }

      const smsResult = await this.sendSMS(user.phoneNumber, message);
      
      const pushResult = await this.sendPushNotification(user.id, {
        title: '🚨 Emergency Alert Update',
        body: message,
        data: {
          type: 'alert_status_update',
          alertId: alert.id,
          status,
          responderName: responderName || ''
        }
      });

      return {
        sms: smsResult,
        push: pushResult
      };
    } catch (error) {
      console.error('Alert status update error:', error);
      throw error;
    }
  }

  /**
   * Send bulk notification to users in a district
   */
  async sendDistrictNotification(district, title, message, data = {}) {
    try {
      const users = await User.findByDistrict(district);
      const notifications = [];
      
      for (const user of users) {
        const pushResult = await this.sendPushNotification(user.id, {
          title,
          body: message,
          data: {
            type: 'district_notification',
            district,
            ...data
          }
        });

        notifications.push({
          userId: user.id,
          sent: pushResult.success
        });
      }

      return {
        totalSent: notifications.filter(n => n.sent).length,
        totalFailed: notifications.filter(n => !n.sent).length,
        notifications
      };
    } catch (error) {
      console.error('District notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
