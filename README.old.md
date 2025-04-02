# Gaming Café Management App

A cross-platform application for managing gaming café operations, including online booking, user management, and payment processing.

## Project Structure

```
📂 gaming-cafe-app
├── 📂 backend (Firebase Functions)
├── 📂 mobile-app (React Native)
└── 📂 web-app (React.js)
```

## Tech Stack

- **Frontend**: 
  - Web: React.js with Tailwind CSS
  - Mobile: React Native
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Functions
- **Payments**: M-Pesa API (Future Integration)

## Features

- User Authentication (Firebase)
- Game Session Booking
- Admin Dashboard
- Real-time Database
- Mobile & Web Synchronization
- Payment Processing (Future)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase CLI
- React Native CLI

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
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
- Copy the configuration to respective firebase-config.js files
- Enable Authentication and Firestore

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

## Development Guidelines

- Follow the established project structure
- Use TypeScript for type safety
- Implement proper error handling
- Write unit tests for critical functionality
- Follow the coding style guide

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
