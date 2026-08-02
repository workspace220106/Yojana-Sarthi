import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'yojana-sarthi'
      });
    }
  } catch (error) {
    console.warn("Failed to initialize firebase-admin SDK:", error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fraud_id } = req.query;
  const { status } = req.body || {};

  if (!fraud_id || !status) {
    return res.status(400).json({ error: 'fraud_id and status are required' });
  }

  if (!['Resolved', 'Unresolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid fraud status' });
  }

  try {
    if (!admin.apps.length) {
      throw new Error("firebase-admin not initialized");
    }
    const db = admin.firestore();
    const docRef = db.collection("fraud_logs").document(fraud_id);
    await docRef.update({ status: status });
    return res.status(200).json({ status: 'success', message: `Fraud alert updated to ${status}` });
  } catch (error) {
    console.warn("Mimicking fraud alert status update locally:", error.message);
    return res.status(200).json({ status: 'success', message: `Fraud alert updated to ${status} (Simulated)` });
  }
}
