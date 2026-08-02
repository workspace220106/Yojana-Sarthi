export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const env = process.env.CASHFREE_ENV || 'sandbox';

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Cashfree credentials not configured' });
  }

  const baseUrl = env === 'production' 
    ? 'https://api.cashfree.com' 
    : 'https://sandbox.cashfree.com';

  const verificationId = `vid_${Math.random().toString(36).substring(2, 14)}`;

  try {
    const { redirect_url } = req.body || {};
    if (!redirect_url) {
      return res.status(400).json({ error: 'redirect_url is required' });
    }

    const response = await fetch(`${baseUrl}/verification/digilocker`, {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verification_id: verificationId,
        redirect_url,
        document_requested: ['AADHAAR', 'PAN', 'DRIVING_LICENSE']
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({
      verification_id: verificationId,
      url: data.url,
      status: data.status
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
