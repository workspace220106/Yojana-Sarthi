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

const mockCitizens = [
  { id: "c1", name: "Ramesh Kumar", age: 34, gender: "Male", state: "Maharashtra", occupation: "Farmer", annual_income: 75000, verification_status: "Verified", category: "General" },
  { id: "c2", name: "Savita Patil", age: 29, gender: "Female", state: "Maharashtra", occupation: "Unemployed", annual_income: 25000, verification_status: "Pending", category: "OBC" },
  { id: "c3", name: "Amit Shinde", age: 45, gender: "Male", state: "Maharashtra", occupation: "Self-Employed", annual_income: 150000, verification_status: "Failed", category: "SC" }
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
    const snap = await db.collection("citizens").get();
    const results = [];
    snap.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return res.status(200).json(results);
  } catch (error) {
    console.warn("Using mock citizens list fallback:", error.message);
    return res.status(200).json(mockCitizens);
  }
}
