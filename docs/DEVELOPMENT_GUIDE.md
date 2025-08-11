# Rwanda Safe Pay - Development Guide

## Quick Start

### Prerequisites
- Node.js 16+ 
- Git
- Firebase account
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone and setup the project:**
```bash
git clone https://github.com/lanari24/safepay.git
cd safepay
git checkout development
node scripts/setup-dev.js
```

2. **Configure environment variables:**
```bash
# Copy and edit backend environment file
cp backend/.env.example backend/.env
# Update with your Firebase and API credentials
```

3. **Start development servers:**
```bash
# Start all services
npm run dev

# Or start individually:
npm run dev-backend    # Backend API on port 3000
npm run dev-web        # Web dashboard on port 3001
npm run dev-mobile     # Mobile app with Expo
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `development` - Main development branch (current)
- `feature/*` - Feature development branches
- `hotfix/*` - Critical bug fixes

### Making Changes

1. **Create feature branch:**
```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

2. **Make your changes and test:**
```bash
# Run tests
npm test

# Check linting
npm run lint
```

3. **Commit and push:**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

4. **Create pull request to development branch**

## Project Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── models/          # Data models
│   └── utils/           # Utility functions
├── package.json
└── .env.example
```

### Mobile App (`/mobile-app`)
```
mobile-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API and external services
│   ├── utils/           # Utility functions
│   └── constants/       # App constants
├── assets/              # Images, fonts, etc.
├── App.js              # Main app component
└── package.json
```

### Web Dashboard (`/web-dashboard`)
```
web-dashboard/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   └── constants/       # App constants
├── public/              # Static assets
└── package.json
```

## Key Development Areas

### 1. Authentication System
- Firebase Authentication integration
- JWT token management
- Role-based access control
- User verification process

### 2. Payment Processing
- Mobile money integration (MTN, Airtel)
- Transaction management
- Payment history and reporting
- USSD fallback system

### 3. Emergency Alert System
- GPS location tracking
- Real-time notifications
- Agent dispatch system
- Emergency contact alerts

### 4. Community Forum
- Real-time messaging
- Content moderation
- Push notifications
- Admin oversight

### 5. Admin Dashboard
- User management
- Payment monitoring
- Emergency alert tracking
- Analytics and reporting

## Testing Strategy

### Backend Testing
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
```

### Mobile App Testing
```bash
cd mobile-app
npm test                # Unit tests
expo start              # Manual testing
```

### Web Dashboard Testing
```bash
cd web-dashboard
npm test                # React testing library
```

## Deployment

### Development Deployment
- Backend: Local Node.js server
- Mobile: Expo development client
- Web: Local React development server

### Production Deployment
- Backend: Cloud hosting (AWS/GCP/Azure)
- Mobile: App stores (Google Play/Apple App Store)
- Web: Static hosting (Netlify/Vercel)

## Security Considerations

### Data Protection
- All sensitive data encrypted
- HTTPS/TLS for all communications
- Secure token storage
- Input validation and sanitization

### Emergency Security
- Location data encryption
- Secure agent notification
- Emergency contact verification
- Audit trails for all actions

## Performance Optimization

### Backend
- Database query optimization
- Caching strategies
- Rate limiting
- Response compression

### Mobile App
- Offline-first architecture
- Image optimization
- Battery-efficient location tracking
- Data synchronization

### Web Dashboard
- Code splitting
- Lazy loading
- CDN for static assets
- Performance monitoring

## Troubleshooting

### Common Issues

1. **Firebase connection errors:**
   - Check environment variables
   - Verify service account key
   - Ensure project ID is correct

2. **Mobile app build errors:**
   - Clear Expo cache: `expo r -c`
   - Reinstall dependencies
   - Check React Native version compatibility

3. **CORS issues:**
   - Update ALLOWED_ORIGINS in backend .env
   - Check frontend API base URL

### Getting Help

- Check existing GitHub issues
- Review API documentation
- Contact development team
- Refer to technology-specific documentation
