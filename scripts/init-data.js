const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function initializeData() {
  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail('tevingichoya@gmail.com');
    
    // Update user's role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'tevingichoya@gmail.com',
      displayName: 'Tevin Gichoya',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      gamesPlayed: 0,
      gamesRemaining: 0,
      prizeWinnings: 0
    }, { merge: true });

    // Create sample tournaments
    const tournaments = [
      {
        name: 'FC 24 Championship',
        game: 'FC 24',
        date: new Date('2024-04-01'),
        prizePool: 5000,
        entryFee: 500,
        maxParticipants: 32,
        currentParticipants: 0,
        status: 'upcoming',
        leaderboard: []
      },
      {
        name: 'FIFA 23 Masters',
        game: 'FIFA 23',
        date: new Date('2024-04-15'),
        prizePool: 3000,
        entryFee: 300,
        maxParticipants: 24,
        currentParticipants: 0,
        status: 'upcoming',
        leaderboard: []
      },
      {
        name: 'FC 25 Pro League',
        game: 'FC 25',
        date: new Date('2024-05-01'),
        prizePool: 10000,
        entryFee: 1000,
        maxParticipants: 64,
        currentParticipants: 0,
        status: 'upcoming',
        leaderboard: []
      }
    ];

    // Add tournaments to Firestore
    for (const tournament of tournaments) {
      await db.collection('tournaments').add(tournament);
    }

    // Create sample PlayStation consoles
    const consoles = [
      {
        number: 'PS4-001',
        location: 'Station 1',
        pricePerHour: 200,
        status: 'available',
        features: ['PS4 Pro', 'DualSense Controller', '4K HDR']
      },
      {
        number: 'PS4-002',
        location: 'Station 2',
        pricePerHour: 200,
        status: 'available',
        features: ['PS4 Pro', 'DualSense Controller', '4K HDR']
      },
      {
        number: 'PS4-003',
        location: 'Station 3',
        pricePerHour: 200,
        status: 'available',
        features: ['PS4 Pro', 'DualSense Controller', '4K HDR']
      }
    ];

    // Add consoles to Firestore
    for (const console of consoles) {
      await db.collection('consoles').add(console);
    }

    console.log('Data initialized successfully!');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

initializeData(); 