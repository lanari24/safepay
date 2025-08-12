# 🇷🇼 Rwanda Safe Pay

**A Digital Safety and Community Payment Platform for Kigali**

Rwanda Safe Pay is a comprehensive digital platform designed to enhance community safety and streamline contribution payments for the "Irondo ry'Umwuga" system in Kigali. The platform provides GPS-enabled emergency services, mobile money payment processing, and community engagement tools.

## 🌟 Features

### 🚨 Emergency Services
- **GPS-enabled SOS alerts** with real-time location tracking
- **Instant notification** to nearby security agents within 2km radius
- **Emergency contact alerts** via SMS and push notifications
- **Response time tracking** and status updates
- **Multi-type emergencies**: Security, Medical, Fire, and General

### 💰 Digital Payments
- **Mobile Money Integration**: MTN Mobile Money and Airtel Money support
- **Flexible Contributions**: Monthly, Quarterly, Annual, and Emergency payments
- **USSD Fallback**: Basic payment functionality for feature phones (*182*24#)
- **Payment History**: Complete transaction tracking and reporting
- **Automated Reminders**: SMS and push notification payment reminders

### 💬 Community Forum
- **Real-time messaging** for community safety discussions
- **Urgent announcements** with priority notifications
- **District-based filtering** for relevant local content
- **Content moderation** and admin oversight
- **Community engagement** tracking and analytics

### 👨‍💼 Admin Dashboard
- **Real-time monitoring** of emergency alerts and responses
- **Payment analytics** with trends and district-wise reporting
- **User management** with role-based access control
- **System health monitoring** and performance metrics
- **Comprehensive reporting** for authorities and stakeholders

## 🏗️ Architecture

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Web Dashboard  │    │   USSD Service  │
│  (React Native) │    │   (React.js)    │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │ (Node.js/Express)│
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Firebase     │
                    │ (Auth + Database)│
                    └─────────────────┘
```

### Technology Stack
- **Backend**: Node.js, Express.js, Firebase Admin SDK
- **Database**: Firebase Firestore with real-time synchronization
- **Authentication**: Firebase Authentication with JWT tokens
- **Mobile App**: React Native with Expo
- **Web Dashboard**: React.js with Material-UI
- **USSD Service**: Node.js with session management
- **Deployment**: Docker, Docker Compose, Nginx
- **Payment Processing**: Mobile Money APIs (MTN/Airtel simulation)
- **Notifications**: Firebase Cloud Messaging, SMS gateway integration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Git
- Firebase account
- Docker (for production deployment)

### 1. Clone and Setup
```bash
git clone https://github.com/lanari24/safepay.git
cd safepay
git checkout development
node scripts/setup-dev.js
```

### 2. Configure Environment
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Update backend/.env with your Firebase and API credentials

# USSD service configuration
cp ussd-service/.env.example ussd-service/.env
# Update ussd-service/.env with your configuration
```

### 3. Start Development
```bash
# Install all dependencies
npm run install-all

# Start all services
npm run dev

# Or start individually:
npm run dev-backend    # Backend API on port 3000
npm run dev-web        # Web dashboard on port 3001
npm run dev-mobile     # Mobile app with Expo
npm run dev-ussd       # USSD service on port 4000
```

### 4. Access the Platform
- **Backend API**: http://localhost:3000
- **Web Dashboard**: http://localhost:3001
- **Mobile App**: Use Expo Go app to scan QR code
- **USSD Service**: http://localhost:4000
- **API Documentation**: http://localhost:3000/health

## 📱 Mobile App Usage

### For Citizens
1. **Register/Login** with phone number and national ID
2. **Make Payments** for monthly/quarterly/annual contributions
3. **Emergency SOS** - Press and hold the red button for 3 seconds
4. **Community Forum** - Stay updated with local safety information
5. **Payment History** - Track all your contributions

### For Security Agents
1. **Receive Alerts** - Get instant notifications for nearby emergencies
2. **Respond to Calls** - Update status (acknowledged, en route, resolved)
3. **Location Tracking** - GPS navigation to emergency locations
4. **Report Status** - Provide updates and resolution notes

## 🖥️ Web Dashboard Usage

### For Administrators
1. **Monitor Emergencies** - Real-time alert tracking and response management
2. **Payment Analytics** - Revenue tracking, success rates, and trends
3. **User Management** - Account verification, role assignment, and support
4. **System Health** - Service monitoring and performance metrics
5. **Reports** - Generate comprehensive reports for stakeholders

### Key Dashboard Features
- **Real-time Statistics** - Live updates on users, payments, and alerts
- **Interactive Maps** - Geographic visualization of emergency alerts
- **Payment Trends** - Charts and analytics for financial tracking
- **User Analytics** - District-wise user distribution and activity

## 📞 USSD Service (*182*24#)

### Basic Menu Structure
```
Welcome to Rwanda Safe Pay
1. Make Payment
2. Check Balance
3. Payment History
4. Emergency
0. Exit
```

### Payment Options
- **Monthly**: 2,000 RWF
- **Quarterly**: 6,000 RWF
- **Annual**: 24,000 RWF
- **Custom Amount**: Minimum 100 RWF

### Emergency Features
- **Send SOS Alert**: Triggers emergency notification
- **Emergency Numbers**: Quick access to 112, 113, 114

## 🧪 Testing

### Run All Tests
```bash
# Comprehensive testing
./scripts/test-all.sh

# Individual component tests
cd backend && npm test
cd mobile-app && npm test
cd web-dashboard && npm test
cd ussd-service && npm test
```

### Test Coverage
- **Backend**: Unit tests for all API endpoints and models
- **Mobile App**: Component and integration tests
- **Web Dashboard**: React component tests
- **USSD Service**: Menu flow and session management tests

## 🚀 Deployment

### Development Deployment
```bash
# Start all services locally
npm run dev
```

### Production Deployment
```bash
# Using Docker Compose
./scripts/deploy.sh production

# Manual deployment
docker-compose up --build -d
```

### Environment Configuration
1. **Firebase Setup**:
   - Create Firebase project
   - Enable Authentication and Firestore
   - Download service account key
   - Update backend/.env with Firebase credentials

2. **Payment Gateway Setup**:
   - Register with MTN Mobile Money API
   - Register with Airtel Money API
   - Configure webhook endpoints
   - Update API keys in backend/.env

3. **SMS Gateway Setup**:
   - Configure SMS provider (Twilio, Africa's Talking)
   - Update SMS API credentials
   - Test emergency notification system

## 📊 Monitoring & Analytics

### System Monitoring
- **Health Checks**: Automated service health monitoring
- **Performance Metrics**: Response times and throughput tracking
- **Error Logging**: Comprehensive error tracking and alerting
- **User Analytics**: Usage patterns and engagement metrics

### Business Analytics
- **Payment Success Rates**: Track transaction success and failure rates
- **Emergency Response Times**: Monitor and optimize response efficiency
- **User Engagement**: Forum activity and platform adoption metrics
- **Geographic Insights**: District-wise usage and payment patterns

## 🔒 Security

### Data Protection
- **End-to-end Encryption**: All sensitive data encrypted in transit and at rest
- **HTTPS/TLS**: Secure communication protocols
- **Data Anonymization**: Privacy-compliant analytics and reporting
- **GDPR Compliance**: User data protection and privacy rights

### Authentication & Authorization
- **Firebase Authentication**: Secure user management
- **JWT Tokens**: Stateless authentication for API access
- **Role-based Access Control**: Citizen, Security Agent, Admin roles
- **Multi-factor Authentication**: Enhanced security for admin accounts

### Emergency Security
- **Location Encryption**: GPS coordinates securely transmitted
- **Agent Verification**: Verified security agent network
- **Audit Trails**: Complete logging of all emergency actions
- **False Alert Prevention**: Penalties and verification systems

## 📚 Documentation

- **[API Documentation](docs/API_DOCUMENTATION.md)**: Complete API reference
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Setup and development workflow
- **[System Architecture](docs/PROJECT_ARCHITECTURE.md)**: Technical architecture details
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
- **Main Branch**: Production-ready code
- **Development Branch**: Main development branch
- **Feature Branches**: Individual feature development
- **Code Review**: All changes require review before merging

## 📞 Support

### Technical Support
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and API reference
- **Community Forum**: Developer discussions and support

### Emergency Support
- **Police**: 112
- **Medical**: 114
- **Fire**: 113
- **Platform Support**: Contact through admin dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rwanda National Police** for security framework guidance
- **Kigali City Council** for administrative support
- **Community Leaders** for requirements and feedback
- **Local Security Agents** for field testing and validation
- **Citizens of Kigali** for participation and trust

## 📈 Project Status

- ✅ **Backend API**: Complete with Firebase integration
- ✅ **Mobile App**: Core features implemented with React Native
- ✅ **Web Dashboard**: Admin interface with real-time monitoring
- ✅ **USSD Service**: Basic payment functionality for feature phones
- ✅ **Testing**: Comprehensive test suite and coverage
- ✅ **Deployment**: Docker-based deployment with CI/CD
- ✅ **Documentation**: Complete technical and user documentation

**Current Version**: 1.0.0
**Last Updated**: August 2024
**Status**: Production Ready

---

**Built with ❤️ for the safety and security of Kigali communities**

## Project Overview

Rwanda Safe Pay is a comprehensive mobile platform that merges digital payments, emergency alerting (SOS with GPS), and community engagement forums into one unified application. It enhances community safety and digital contribution services in Kigali by supporting the "Irondo ry'Umwuga" (professional neighborhood patrols) system.

## Features

### Core Features
- **Digital Payments**: Secure and transparent payments for Irondo services ("umusanzu w'irondo")
- **GPS-Enabled SOS**: Emergency alert system that notifies nearby security agents
- **Community Forum**: Real-time communication platform between citizens and local authorities
- **USSD Support**: Fallback system for basic functionality

### Target Users
- Kigali urban residents
- Neighborhood patrol members (Irondo)
- Local authorities and security administrators
- Emergency responders

## Technology Stack

- **Mobile App**: React Native
- **Backend API**: Node.js + Express
- **Database**: Firebase/Firestore
- **Authentication**: Firebase Auth
- **Maps & GPS**: Google Maps API / Mapbox
- **USSD Gateway**: Integration with local telecom providers
- **Web Dashboard**: React.js

## Project Structure

```
rwanda-safe-pay/
├── mobile-app/          # React Native mobile application
├── backend/             # Node.js + Express API server
├── web-dashboard/       # React.js admin dashboard
├── ussd-service/        # USSD gateway integration
├── docs/                # Project documentation
├── scripts/             # Deployment and utility scripts
└── README.md
```

## Implementation Timeline (3 Months)

### Month 1: Foundation
- Research and system architecture
- UI/UX design
- Development environment setup
- Database schema design

### Month 2: Core Development
- User registration and authentication
- Payment system integration
- GPS-enabled SOS functionality
- Basic mobile app features

### Month 3: Integration & Launch
- Community forum implementation
- USSD integration
- Testing and security audits
- Pilot deployment in Gasabo district

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native development environment
- Firebase account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lanari24/safepay.git
cd safepay
```

2. Install dependencies for each component:
```bash
# Backend
cd backend && npm install

# Mobile App
cd ../mobile-app && npm install

# Web Dashboard
cd ../web-dashboard && npm install
```

3. Set up environment variables (see individual component README files)

4. Start development servers:
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Mobile App (Terminal 2)
cd mobile-app && npm start

# Web Dashboard (Terminal 3)
cd web-dashboard && npm start
```

## Contributing

1. Create a feature branch from `development`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact the development team.

---

**Rwanda Safe Pay** - Enhancing Community Safety and Digital Contribution Services in Kigali
