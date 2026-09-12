// Vercel Serverless Function: Create Razorpay Order
// POST /api/razorpay/create-order

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
    const { amount, bookingId, currency = 'INR', notes = {} } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid offering amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In local sandbox / testing without credentials, provide mock order response
    if (!keyId || !keySecret || keyId.includes('YourKeyId')) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.status(200).json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency,
        keyId: keyId || 'rzp_test_mockKey12345',
        isSandbox: true,
        bookingId
      });
    }

    // Live Razorpay API call using native fetch & Basic Auth
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // in paise
        currency,
        receipt: (bookingId || `receipt_${Date.now()}`).substring(0, 40),
        notes: {
          bookingId: bookingId || '',
          parish: 'Our Lady of Dolours',
          ...notes
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.error?.description || 'Failed to create Razorpay order'
      });
    }

    return res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
      bookingId
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
