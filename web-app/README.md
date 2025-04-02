# Ground Zero - Gaming Cafe

A modern web application for managing a gaming cafe in Kirigiti, Kiambu. Built with React, Material-UI, and Firebase.

## Features

- User authentication and profile management
- PlayStation console booking system
- Tournament management and participation
- Support ticket system
- Admin dashboard for managing bookings and consoles
- Shop section for gaming accessories and merchandise

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account and project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ground-zero/web-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
web-app/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── videos/
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── PrivateRoute.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── ProfilePage.js
│   │   ├── SupportPage.js
│   │   ├── BookingPage.js
│   │   ├── TournamentsPage.js
│   │   ├── ShopPage.js
│   │   └── admin/
│   │       ├── AdminDashboard.js
│   │       ├── AdminBookings.js
│   │       └── AdminConsoles.js
│   ├── App.js
│   ├── index.js
│   └── firebase.js
├── package.json
└── README.md
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 