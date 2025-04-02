# Gaming Café Management App - Backend

This is the backend server for the Gaming Café Management App, built with Firebase Functions and Express.

## Prerequisites

- Node.js (v18 or higher)
- Firebase CLI
- Firebase project
- M-Pesa API credentials

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Firebase:
   - Create a new Firebase project
   - Enable Firestore and Authentication
   - Download your service account key and save it as `serviceAccountKey.json`
   - Update the `.env` file with your Firebase project details

3. Set up M-Pesa:
   - Get your M-Pesa API credentials
   - Update the `.env` file with your M-Pesa credentials

4. Start the development server:
   ```bash
   npm run serve
   ```

## API Endpoints

### PCs
- `GET /api/pcs` - Get all available PCs

### Bookings
- `GET /api/bookings` - Get user's bookings (requires authentication)
- `POST /api/bookings` - Create a new booking (requires authentication)

## Deployment

1. Deploy to Firebase:
   ```bash
   npm run deploy
   ```

2. Update the frontend `.env` file with the deployed API URL

## Project Structure

```
backend/
├── src/
│   ├── index.js         # Main server file
│   └── firebase-config.js # Firebase configuration
├── serviceAccountKey.json # Firebase service account key
├── .env                  # Environment variables
└── package.json         # Project dependencies
```

## API Endpoints

### Authentication

#### GET /api/auth/profile
Get the current user's profile.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "id": "string",
  "displayName": "string",
  "email": "string",
  "phoneNumber": "string",
  "address": "string"
}
```

#### PUT /api/auth/profile
Update the current user's profile.

**Headers:**
- Authorization: Bearer {token}

**Body:**
```json
{
  "displayName": "string",
  "phoneNumber": "string",
  "address": "string"
}
```

### Bookings

#### GET /api/bookings/slots
Get available time slots for a specific date.

**Query Parameters:**
- date: ISO date string

**Response:**
```json
[
  {
    "time": "string",
    "available": boolean
  }
]
```

#### POST /api/bookings
Create a new booking.

**Headers:**
- Authorization: Bearer {token}

**Body:**
```json
{
  "date": "string",
  "timeSlot": number,
  "duration": number
}
```

#### PUT /api/bookings/:bookingId/confirm
Confirm a booking.

**Headers:**
- Authorization: Bearer {token}

#### PUT /api/bookings/:bookingId/cancel
Cancel a booking.

**Headers:**
- Authorization: Bearer {token}

### Payments

#### POST /api/payments/initiate
Initiate a payment for a booking.

**Headers:**
- Authorization: Bearer {token}

**Body:**
```json
{
  "bookingId": "string"
}
```

#### POST /api/payments/callback
M-Pesa payment callback endpoint.

**Body:**
```json
{
  "checkoutRequestId": "string",
  "merchantRequestId": "string",
  "resultCode": number,
  "resultDesc": "string",
  "transactionId": "string"
}
```

#### GET /api/payments/history
Get payment history for the current user.

**Headers:**
- Authorization: Bearer {token}

### Users (Admin Only)

#### GET /api/users
Get all users.

**Headers:**
- Authorization: Bearer {token}

#### GET /api/users/:userId
Get user by ID.

**Headers:**
- Authorization: Bearer {token}

#### PUT /api/users/:userId/role
Update user role.

**Headers:**
- Authorization: Bearer {token}

**Body:**
```json
{
  "role": "string"
}
```

#### GET /api/users/:userId/bookings
Get user's booking history.

**Headers:**
- Authorization: Bearer {token}

#### GET /api/users/:userId/payments
Get user's payment history.

**Headers:**
- Authorization: Bearer {token}

#### DELETE /api/users/:userId
Delete a user.

**Headers:**
- Authorization: Bearer {token}

## Error Responses

All endpoints may return the following error responses:

```json
{
  "error": "string",
  "message": "string"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

### Project Structure

```
backend/
├── src/
│   ├── index.js           # Main entry point
│   ├── firebase-config.js # Firebase configuration
│   └── routes/            # API routes
│       ├── auth.js
│       ├── bookings.js
│       ├── payments.js
│       └── users.js
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Deployment

```bash
npm run deploy
``` 