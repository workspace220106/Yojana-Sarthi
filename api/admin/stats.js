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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!admin.apps.length) {
      throw new Error("firebase-admin not initialized");
    }
    const db = admin.firestore();
    const citizensSnap = await db.collection("citizens").get();
    const fraudSnap = await db.collection("fraud_logs").get();

    let total = 0, verified = 0, pending = 0, failed = 0;
    citizensSnap.forEach(doc => {
      total++;
      const status = doc.data().verification_status || "Pending";
      if (status === "Verified") verified++;
      else if (status === "Failed") failed++;
      else pending++;
    });

    let unresolvedFraud = 0;
    fraudSnap.forEach(doc => {
      if (doc.data().status === "Unresolved") unresolvedFraud++;
    });

    return res.status(200).json({
      total_users: total,
      verified_users: verified,
      pending_verifications: pending,
      failed_verifications: failed,
      unresolved_fraud_alerts: unresolvedFraud
    });
  } catch (error) {
    console.warn("Using mock admin stats fallback:", error.message);
    return res.status(200).json({
      total_users: 3,
      verified_users: 1,
      pending_verifications: 1,
      failed_verifications: 1,
      unresolved_fraud_alerts: 1
    });
  }
}
