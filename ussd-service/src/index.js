const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.USSD_PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// USSD Menu Structure
const MENU_STATES = {
  MAIN: 'main',
  PAYMENT: 'payment',
  AMOUNT: 'amount',
  CONFIRM: 'confirm',
  BALANCE: 'balance',
  HISTORY: 'history',
  EMERGENCY: 'emergency'
};

// USSD Session Storage (in production, use Redis or database)
const sessions = new Map();

/**
 * Main USSD handler
 */
app.post('/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });
  
  let response = '';
  
  try {
    // Get or create session
    let session = sessions.get(sessionId) || {
      phoneNumber,
      state: MENU_STATES.MAIN,
      data: {}
    };
    
    // Process USSD input
    response = processUSSDInput(text, session);
    
    // Update session
    sessions.set(sessionId, session);
    
    // Clean up old sessions (simple cleanup)
    if (sessions.size > 1000) {
      const oldSessions = Array.from(sessions.keys()).slice(0, 100);
      oldSessions.forEach(key => sessions.delete(key));
    }
    
  } catch (error) {
    console.error('USSD Error:', error);
    response = 'END Service temporarily unavailable. Please try again later.';
  }
  
  res.set('Content-Type', 'text/plain');
  res.send(response);
});

/**
 * Process USSD input based on current state
 */
function processUSSDInput(text, session) {
  const input = text.split('*');
  const lastInput = input[input.length - 1];
  
  switch (session.state) {
    case MENU_STATES.MAIN:
      return handleMainMenu(lastInput, session);
    
    case MENU_STATES.PAYMENT:
      return handlePaymentMenu(lastInput, session);
    
    case MENU_STATES.AMOUNT:
      return handleAmountInput(lastInput, session);
    
    case MENU_STATES.CONFIRM:
      return handleConfirmation(lastInput, session);
    
    case MENU_STATES.BALANCE:
      return handleBalanceInquiry(session);
    
    case MENU_STATES.HISTORY:
      return handlePaymentHistory(session);
    
    case MENU_STATES.EMERGENCY:
      return handleEmergencyMenu(lastInput, session);
    
    default:
      return getMainMenu();
  }
}

/**
 * Main menu handler
 */
function handleMainMenu(input, session) {
  if (!input || input === '') {
    return getMainMenu();
  }
  
  switch (input) {
    case '1':
      session.state = MENU_STATES.PAYMENT;
      return getPaymentMenu();
    
    case '2':
      session.state = MENU_STATES.BALANCE;
      return handleBalanceInquiry(session);
    
    case '3':
      session.state = MENU_STATES.HISTORY;
      return handlePaymentHistory(session);
    
    case '4':
      session.state = MENU_STATES.EMERGENCY;
      return getEmergencyMenu();
    
    case '0':
      return 'END Thank you for using Rwanda Safe Pay!';
    
    default:
      return 'CON Invalid option. Please try again.\n' + getMainMenuOptions();
  }
}

/**
 * Payment menu handler
 */
function handlePaymentMenu(input, session) {
  switch (input) {
    case '1':
      session.data.contributionType = 'monthly';
      session.data.amount = 2000;
      session.state = MENU_STATES.CONFIRM;
      return getPaymentConfirmation(session);
    
    case '2':
      session.data.contributionType = 'quarterly';
      session.data.amount = 6000;
      session.state = MENU_STATES.CONFIRM;
      return getPaymentConfirmation(session);
    
    case '3':
      session.data.contributionType = 'annual';
      session.data.amount = 24000;
      session.state = MENU_STATES.CONFIRM;
      return getPaymentConfirmation(session);
    
    case '4':
      session.state = MENU_STATES.AMOUNT;
      return 'CON Enter custom amount (minimum 100 RWF):';
    
    case '0':
      session.state = MENU_STATES.MAIN;
      return getMainMenu();
    
    default:
      return 'CON Invalid option. Please try again.\n' + getPaymentMenuOptions();
  }
}

/**
 * Amount input handler
 */
function handleAmountInput(input, session) {
  const amount = parseInt(input);
  
  if (isNaN(amount) || amount < 100) {
    return 'CON Invalid amount. Enter amount (minimum 100 RWF):';
  }
  
  session.data.contributionType = 'custom';
  session.data.amount = amount;
  session.state = MENU_STATES.CONFIRM;
  
  return getPaymentConfirmation(session);
}

/**
 * Payment confirmation handler
 */
function handleConfirmation(input, session) {
  switch (input) {
    case '1':
      return processPayment(session);
    
    case '2':
      session.state = MENU_STATES.PAYMENT;
      return getPaymentMenu();
    
    case '0':
      session.state = MENU_STATES.MAIN;
      return getMainMenu();
    
    default:
      return 'CON Invalid option. Please try again.\n' + getConfirmationOptions();
  }
}

/**
 * Balance inquiry handler
 */
function handleBalanceInquiry(session) {
  // In a real implementation, this would query the backend API
  const mockBalance = {
    totalContributed: 15000,
    thisMonth: 2000,
    nextDue: '2024-09-01',
    status: 'Up to date'
  };
  
  return `END Your Rwanda Safe Pay Balance:
Total Contributed: ${mockBalance.totalContributed} RWF
This Month: ${mockBalance.thisMonth} RWF
Next Due: ${mockBalance.nextDue}
Status: ${mockBalance.status}`;
}

/**
 * Payment history handler
 */
function handlePaymentHistory(session) {
  // In a real implementation, this would query the backend API
  const mockHistory = [
    { date: '2024-08-01', amount: 2000, type: 'Monthly', status: 'Completed' },
    { date: '2024-07-01', amount: 2000, type: 'Monthly', status: 'Completed' },
    { date: '2024-06-01', amount: 2000, type: 'Monthly', status: 'Completed' }
  ];
  
  let response = 'END Recent Payments:\n';
  mockHistory.forEach((payment, index) => {
    response += `${index + 1}. ${payment.date}: ${payment.amount} RWF (${payment.type})\n`;
  });
  
  return response;
}

/**
 * Emergency menu handler
 */
function handleEmergencyMenu(input, session) {
  switch (input) {
    case '1':
      return 'END Emergency alert sent! Security agents have been notified. Stay safe.';
    
    case '2':
      return 'END Police: 112\nMedical: 114\nFire: 113\nStay safe!';
    
    case '0':
      session.state = MENU_STATES.MAIN;
      return getMainMenu();
    
    default:
      return 'CON Invalid option. Please try again.\n' + getEmergencyMenuOptions();
  }
}

/**
 * Process payment (simulate)
 */
function processPayment(session) {
  const { amount, contributionType } = session.data;
  const reference = `SP${Date.now()}`;
  
  // In a real implementation, this would:
  // 1. Call the main backend API
  // 2. Process the payment through mobile money
  // 3. Send confirmation SMS
  
  console.log('Processing USSD payment:', {
    phoneNumber: session.phoneNumber,
    amount,
    contributionType,
    reference
  });
  
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return `END Payment successful!
Amount: ${amount} RWF
Type: ${contributionType}
Reference: ${reference}
You will receive SMS confirmation.`;
  } else {
    return `END Payment failed. Please try again or contact support.
Reference: ${reference}`;
  }
}

// Menu generators
function getMainMenu() {
  return 'CON Welcome to Rwanda Safe Pay\n' + getMainMenuOptions();
}

function getMainMenuOptions() {
  return `1. Make Payment
2. Check Balance
3. Payment History
4. Emergency
0. Exit`;
}

function getPaymentMenu() {
  return 'CON Select Payment Type:\n' + getPaymentMenuOptions();
}

function getPaymentMenuOptions() {
  return `1. Monthly (2,000 RWF)
2. Quarterly (6,000 RWF)
3. Annual (24,000 RWF)
4. Custom Amount
0. Back`;
}

function getPaymentConfirmation(session) {
  const { amount, contributionType } = session.data;
  return `CON Confirm Payment:
Amount: ${amount} RWF
Type: ${contributionType}
Phone: ${session.phoneNumber}

1. Confirm
2. Change Amount
0. Main Menu`;
}

function getConfirmationOptions() {
  return `1. Confirm
2. Change Amount
0. Main Menu`;
}

function getEmergencyMenu() {
  return 'CON Emergency Services:\n' + getEmergencyMenuOptions();
}

function getEmergencyMenuOptions() {
  return `1. Send SOS Alert
2. Emergency Numbers
0. Back`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Rwanda Safe Pay USSD Service',
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rwanda Safe Pay USSD Service running on port ${PORT}`);
  console.log(`📱 USSD endpoint: http://localhost:${PORT}/ussd`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
