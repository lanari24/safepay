import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Dashboard from './components/Dashboard';
// import Login from './components/auth/Login';
// import Users from './components/Users';
// import Payments from './components/Payments';
// import EmergencyAlerts from './components/EmergencyAlerts';
// import Forum from './components/Forum';
// import Settings from './components/Settings';

// Temporary placeholder component
const PlaceholderPage = ({ title, description }) => (
  <div style={{ 
    padding: '40px', 
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  }}>
    <h1 style={{ color: '#2E7D32', marginBottom: '20px' }}>
      🇷🇼 Rwanda Safe Pay
    </h1>
    <h2 style={{ color: '#1B5E20', marginBottom: '20px' }}>
      {title}
    </h2>
    <p style={{ color: '#424242', fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
      {description}
    </p>
    <div style={{ 
      marginTop: '30px', 
      padding: '20px', 
      backgroundColor: '#E8F5E8', 
      borderRadius: '10px',
      maxWidth: '500px'
    }}>
      <h3 style={{ color: '#2E7D32', marginBottom: '15px' }}>Platform Features</h3>
      <ul style={{ textAlign: 'left', color: '#1B5E20' }}>
        <li>💰 Digital payments for Irondo community contributions</li>
        <li>🚨 GPS-enabled SOS emergency alert system</li>
        <li>💬 Community safety forum</li>
        <li>👥 User and agent management</li>
        <li>📊 Real-time analytics and reporting</li>
        <li>📱 USSD fallback support</li>
      </ul>
    </div>
  </div>
);

// Placeholder components for unimplemented features
const Login = () => (
  <PlaceholderPage
    title="Administrator Login"
    description="Secure access for local authorities and security administrators."
  />
);

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green for Rwanda
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FFC107', // Amber for accent
      light: '#FFEB3B',
      dark: '#FF8F00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  // TODO: Implement authentication state management
  const isAuthenticated = false; // Placeholder

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={<Login />} 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            {/* Additional routes will be added here */}
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
