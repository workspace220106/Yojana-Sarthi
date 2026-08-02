

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { verification_id } = req.query;
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const env = process.env.CASHFREE_ENV || 'sandbox';

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Cashfree credentials not configured' });
  }

  const baseUrl = env === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';

  try {
    const response = await fetch(`${baseUrl}/verification/digilocker?verification_id=${verification_id}`, {
      method: 'GET',
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
