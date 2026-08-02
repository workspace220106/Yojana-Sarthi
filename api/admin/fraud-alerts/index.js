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
    console.warn("Failed to initialize firebase-admin SDK, will use mock mode fallback:", error);
  }
}

const mockFraudLogs = [
  { id: "f1", citizen_id: "c2", citizen_name: "Savita Patil", alert_type: "Income Discrepancy", details: "Income Certificate shows ₹25,000 but bank verification shows ₹2,50,000.", status: "Unresolved", timestamp: new Date().toISOString() }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!admin.apps.length) {
      throw new Error("firebase-admin not initialized");
    }
    const db = admin.firestore();
    const snap = await db.collection("fraud_logs").get();
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return res.status(200).json(results);
  } catch (error) {
    console.warn("Using mock fraud alerts list fallback:", error.message);
    return res.status(200).json(mockFraudLogs);
  }
}
