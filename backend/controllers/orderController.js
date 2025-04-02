const MpesaService = require('../services/mpesaService');
const admin = require('firebase-admin');

const db = admin.firestore();
const mpesaService = new MpesaService();

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, phoneNumber } = req.body;
    
    // Calculate total amount
    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Create order in Firestore
    const orderRef = await db.collection('orders').add({
      userId: req.user.uid,
      items,
      amount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Initiate M-Pesa payment
    const payment = await mpesaService.initiatePayment(phoneNumber, amount, orderRef.id);

    res.status(201).json({
      orderId: orderRef.id,
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.orderId).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    if (order.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ id: orderDoc.id, ...order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleMpesaCallback = async (req, res) => {
  try {
    const result = await mpesaService.handleCallback(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 