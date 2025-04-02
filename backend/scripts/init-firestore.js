const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFirestore() {
  try {
    // Create sample admin user
    await db.collection('users').doc('admin').set({
      email: 'admin@gamingcafe.com',
      role: 'admin',
      name: 'Admin User',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create sample PCs
    const pcs = [
      {
        name: 'PC-1',
        specs: {
          cpu: 'Intel Core i7-12700K',
          gpu: 'NVIDIA RTX 3080',
          ram: '32GB DDR4',
          storage: '1TB NVMe SSD'
        },
        hourlyRate: 100,
        status: 'available'
      },
      {
        name: 'PC-2',
        specs: {
          cpu: 'AMD Ryzen 9 5900X',
          gpu: 'NVIDIA RTX 3070',
          ram: '16GB DDR4',
          storage: '500GB NVMe SSD'
        },
        hourlyRate: 80,
        status: 'available'
      },
      {
        name: 'PC-3',
        specs: {
          cpu: 'Intel Core i5-12600K',
          gpu: 'NVIDIA RTX 3060',
          ram: '16GB DDR4',
          storage: '500GB NVMe SSD'
        },
        hourlyRate: 60,
        status: 'available'
      }
    ];

    // Add PCs to Firestore
    const batch = db.batch();
    pcs.forEach((pc) => {
      const pcRef = db.collection('pcs').doc();
      batch.set(pcRef, {
        ...pc,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    console.log('Successfully initialized Firestore with sample data!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    process.exit(1);
  }
}

initializeFirestore(); 