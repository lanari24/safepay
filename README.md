# Rwanda Safe Pay

A Digital Safety and Community Payment Platform for Kigali

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
