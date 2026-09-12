// Vercel Serverless Function: Verify Razorpay Payment Signature
// POST /api/razorpay/verify-payment

import crypto from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      isSandbox = false
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In sandbox or demo mode when secret key is not set
    if (isSandbox || !keySecret || keySecret.includes('your_razorpay')) {
      return res.status(200).json({
        success: true,
        verified: true,
        isSandbox: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        bookingId,
        message: 'Payment verified successfully (Sandbox Mode)'
      });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return res.status(200).json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        bookingId,
        message: 'Payment verified and authenticated securely'
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during verification'
    });
  }
}
