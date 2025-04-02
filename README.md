# Gaming Café Management App

A cross-platform application for managing gaming café bookings, user authentication, and payments.

## Project Structure

```
gaming-cafe-app/
├── backend/           # Firebase Functions
├── mobile-app/        # React Native Mobile App
└── web-app/          # React.js Web App
```

## Tech Stack

- **Frontend:**
  - Web: React.js with Tailwind CSS
  - Mobile: React Native
- **Backend:** Firebase
  - Authentication
  - Firestore Database
  - Cloud Functions
- **Payments:** M-Pesa API (Future Integration)

## Features

1. User Authentication (Firebase)
   - Google Sign-in
   - Email/Password Login
   - User Registration

2. Game Booking System
   - Real-time slot availability
   - Booking management
   - Session tracking

3. Admin Dashboard
   - User management
   - Booking oversight
   - Payment tracking

4. Payment Integration
   - M-Pesa API integration (Future)
   - Payment history
   - Transaction management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase CLI
- React Native CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gaming-cafe-app.git
cd gaming-cafe-app
```

2. Install dependencies for each project:
```bash
# Backend
cd backend
npm install

# Web App
cd ../web-app
npm install

# Mobile App
cd ../mobile-app
npm install
```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase configuration

4. Start the development servers:
```bash
# Backend
cd backend
npm run serve

# Web App
cd web-app
npm start

# Mobile App
cd mobile-app
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
