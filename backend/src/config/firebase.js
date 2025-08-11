const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

// Get Firestore database instance
const getFirestore = () => {
  return admin.firestore();
};

// Get Firebase Auth instance
const getAuth = () => {
  return admin.auth();
};

// Get Firebase Realtime Database instance
const getDatabase = () => {
  return admin.database();
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

// Create custom token
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('Custom token creation error:', error);
    throw error;
  }
};

// Collections references
const collections = {
  USERS: 'users',
  PAYMENTS: 'payments',
  EMERGENCY_ALERTS: 'emergency_alerts',
  FORUM_POSTS: 'forum_posts',
  FORUM_COMMENTS: 'forum_comments',
  NOTIFICATIONS: 'notifications',
  SECURITY_AGENTS: 'security_agents',
  ADMIN_LOGS: 'admin_logs'
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  getDatabase,
  verifyIdToken,
  createCustomToken,
  collections,
  admin
};
