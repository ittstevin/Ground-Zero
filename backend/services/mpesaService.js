const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const admin = require('firebase-admin');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.baseUrl = process.env.MPESA_BASE_URL;
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  generateTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  generatePassword() {
    const timestamp = this.generateTimestamp();
    const str = this.shortcode + this.passkey + timestamp;
    return crypto.createHash('md5').update(str).digest('base64');
  }

  async initiatePayment(phoneNumber, amount, orderId) {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const shortcode = process.env.MPESA_SHORTCODE;
      const passkey = process.env.MPESA_PASSKEY;
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: phoneNumber,
          PartyB: shortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: `${process.env.BASE_URL}/api/payments/callback`,
          AccountReference: orderId,
          TransactionDesc: 'Payment for order'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  async handleCallback(data) {
    try {
      const resultCode = data.Body.stkCallback.CallbackMetadata.Item.find(
        item => item.Name === 'ResultCode'
      ).Value;

      if (resultCode === 0) {
        const mpesaReference = data.Body.stkCallback.CallbackMetadata.Item.find(
          item => item.Name === 'MpesaReceiptNumber'
        ).Value;

        await admin.firestore().collection('payments').doc(data.Body.stkCallback.MerchantRequestID).update({
          status: 'completed',
          mpesaReference,
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update order status
        const orderRef = admin.firestore().collection('orders').doc(data.Body.stkCallback.AccountReference);
        await orderRef.update({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await admin.firestore().collection('payments').doc(data.Body.stkCallback.MerchantRequestID).update({
          status: 'failed',
          errorMessage: data.Body.stkCallback.ResultDesc,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling callback:', error);
      throw error;
    }
  }

  async assignGameKey(order) {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const availableKey = product.keys.find(key => !key.isUsed);
      
      if (availableKey) {
        item.key = availableKey.key;
        availableKey.isUsed = true;
        availableKey.usedAt = new Date();
        availableKey.usedBy = order.user;
        await product.save();
      }
    }
    
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();
  }
}

module.exports = MpesaService; 