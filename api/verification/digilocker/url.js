export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { redirect_url } = req.body || {};
  if (!redirect_url) {
    return res.status(400).json({ error: 'redirect_url is required' });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const env = process.env.CASHFREE_ENV || 'sandbox';

  const verificationId = `vid_${Math.random().toString(36).substring(2, 14)}`;

  const generateSimulatedResponse = () => {
    const simId = `sim_${Math.random().toString(36).substring(2, 14)}`;
    return {
      verification_id: simId,
      url: `${redirect_url}${redirect_url.includes('?') ? '&' : '?'}verification_id=${simId}`,
      status: 'PENDING',
      simulated: true
    };
  };

  // Fallback to simulation if credentials are missing or if redirect_url is non-https
  if (!clientId || !clientSecret || !redirect_url.startsWith('https://')) {
    console.warn('Using simulated DigiLocker flow because Cashfree credentials are missing or redirect_url is not HTTPS.');
    return res.status(200).json(generateSimulatedResponse());
  }

  const baseUrl = env === 'production' 
    ? 'https://api.cashfree.com' 
    : 'https://sandbox.cashfree.com';

  try {
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
      console.warn('Cashfree API error, falling back to simulated DigiLocker flow:', data);
      return res.status(200).json(generateSimulatedResponse());
    }

    return res.status(200).json({
      verification_id: verificationId,
      url: data.url,
      status: data.status
    });
  } catch (error) {
    console.warn('Fetch error, falling back to simulated DigiLocker flow:', error.message);
    return res.status(200).json(generateSimulatedResponse());
  }
}
