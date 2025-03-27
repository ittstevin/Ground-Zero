# Gaming Café App 🎮

A **full-stack** mobile and web application designed to **manage gaming café operations**, including **game session bookings, payments, and customer management**.

## 📌 Features
✅ **Game Session Booking** – Users can book gaming sessions online.  
✅ **User Authentication** – Secure login/signup with Firebase.  
✅ **Admin Dashboard** – Manage bookings and customer activities.  
✅ **Payments Integration** – Placeholder for **M-Pesa API** support.  
✅ **Cross-Platform Support** – Built with **React Native (mobile)** and **React.js (web)**.  

## 🏗 Project Structure
```
📂 gaming-cafe-app
├── 📂 backend (Firebase Functions)
│   ├── index.js  (Handles API requests)
│   ├── firebase-config.js  (Firebase setup)
│   ├── gameBooking.js  (Game session logic)
│   ├── payments.js  (M-Pesa API placeholder)
│   ├── users.js  (User authentication)
│   └── README.md  (Backend documentation)
│
├── 📂 mobile-app (React Native)
│   ├── App.js  (Main component)
│   ├── 📂 screens
│   │   ├── HomeScreen.js
│   │   ├── BookingScreen.js  (Game session booking UI)
│   │   ├── ProfileScreen.js
│   │   ├── PaymentsScreen.js
│   │   └── LoginScreen.js  (Firebase Auth UI)
│   ├── 📂 components
│   ├── firebase.js  (Connects to backend)
│   ├── navigation.js  (App navigation)
│   ├── auth.js  (Handles Firebase authentication)
│   ├── bookingService.js  (Handles game bookings)
│   └── styles.js  (CSS styling)
│
├── 📂 web-app (React.js)
│   ├── src
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── 📂 pages
│   │   │   ├── HomePage.js
│   │   │   ├── BookingPage.js  (Game session booking UI)
│   │   │   ├── AdminDashboard.js
│   │   │   ├── PaymentsPage.js
│   │   │   └── LoginPage.js  (Firebase Auth UI)
│   │   ├── 📂 components
│   │   ├── firebase.js  (Connects to backend)
│   │   ├── auth.js  (Handles Firebase authentication)
│   │   ├── bookingService.js  (Handles game bookings)
│   │   ├── routes.js  (Handles page navigation)
│   │   ├── styles.css  (Global styles)
│   │   └── README.md  (Web app documentation)
│
└── README.md  (Project documentation)
```

## 🔧 Tech Stack
- **Frontend:** React.js (Web), React Native (Mobile)  
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)  
- **Payments:** M-Pesa API (Future Integration)  

## 🚀 Getting Started
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/gaming-cafe-app.git
cd gaming-cafe-app
```

### **2️⃣ Install Dependencies**
For the **mobile app**:
```bash
cd mobile-app
npm install
```
For the **web app**:
```bash
cd web-app
npm install
```

### **3️⃣ Run the Application**
To start the **backend**:
```bash
cd backend
npm start
```
To start the **mobile app**:
```bash
cd mobile-app
npm start
```
To start the **web app**:
```bash
cd web-app
npm start
```

## 🤝 Contributing
Contributions & feedback are welcome! 🎮✨
