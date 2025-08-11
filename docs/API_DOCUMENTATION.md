# Rwanda Safe Pay API Documentation

## Overview

The Rwanda Safe Pay API provides endpoints for managing community safety payments, emergency alerts, and forum interactions in Kigali.

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.rwandasafepay.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+250788123456",
  "nationalId": "1234567890123456",
  "district": "Gasabo",
  "sector": "Kimironko",
  "cell": "Bibare"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_001",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Payment Endpoints

#### POST /payments/contribute
Make a contribution payment for Irondo services.

**Request Body:**
```json
{
  "amount": 2000,
  "paymentMethod": "mobile_money",
  "phoneNumber": "+250788123456",
  "contributionType": "monthly",
  "description": "Monthly Irondo contribution"
}
```

#### GET /payments/history
Get user's payment history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by payment status
- `contributionType` (optional): Filter by contribution type

### Emergency Endpoints

#### POST /emergency/sos
Trigger an emergency SOS alert.

**Request Body:**
```json
{
  "latitude": -1.9441,
  "longitude": 30.0619,
  "emergencyType": "security",
  "description": "Suspicious activity near my location"
}
```

**Response:**
```json
{
  "message": "Emergency alert sent successfully",
  "alertId": "sos_1691234567890",
  "status": "active",
  "estimatedResponseTime": "5-10 minutes",
  "nearbyAgents": 3
}
```

#### GET /emergency/alerts
Get user's emergency alerts history.

### Forum Endpoints

#### GET /forum/posts
Get community forum posts.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Posts per page
- `category` (optional): Filter by category
- `district` (optional): Filter by district

#### POST /forum/posts
Create a new forum post.

**Request Body:**
```json
{
  "title": "Security Update - Kimironko Sector",
  "content": "Increased patrols in the area...",
  "category": "security_update",
  "isUrgent": false
}
```

### User Endpoints

#### GET /users/profile
Get current user profile.

#### PUT /users/profile
Update user profile information.

#### GET /users/notifications
Get user notifications.

### Admin Endpoints

#### GET /admin/dashboard
Get admin dashboard statistics (Admin only).

#### GET /admin/users
Get all users with filtering (Admin only).

#### GET /admin/emergency-alerts
Get all emergency alerts for monitoring (Admin only).

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [] // Optional validation details
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to 100 requests per 15-minute window per IP address.

## Data Formats

### Dates
All dates are in ISO 8601 format: `2024-08-10T14:30:00Z`

### Phone Numbers
Phone numbers must be in Rwanda format: `+250788123456`

### Currency
All amounts are in Rwandan Francs (RWF) as integers (e.g., 2000 for 2000 RWF)

### Location
Coordinates use decimal degrees format:
- Latitude: -90 to 90
- Longitude: -180 to 180
