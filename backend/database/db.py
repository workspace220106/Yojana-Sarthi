import firebase_admin
from firebase_admin import credentials, firestore
import logging

logger = logging.getLogger(__name__)

db = None
is_mock = False

class MockDocument:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data

    def to_dict(self):
        return self._data

    @property
    def exists(self):
        return True

class MockCollection:
    def __init__(self, name, db_ref):
        self.name = name
        self.db_ref = db_ref

    def stream(self):
        if self.name == "citizens":
            return [MockDocument(cid, data) for cid, data in self.db_ref.citizens_store.items()]
        elif self.name == "fraud_logs":
            return [MockDocument(fid, data) for fid, data in self.db_ref.fraud_store.items()]
        return []

    def document(self, doc_id):
        return MockDocumentReference(self.name, doc_id, self.db_ref)

class MockDocumentReference:
    def __init__(self, collection_name, doc_id, db_ref):
        self.collection_name = collection_name
        self.doc_id = doc_id
        self.db_ref = db_ref

    def get(self):
        store = self.db_ref.citizens_store if self.collection_name == "citizens" else self.db_ref.fraud_store
        data = store.get(self.doc_id)
        if not data:
            # Create a default document if it doesn't exist to prevent crash
            data = {
                "name": "New User",
                "age": 30,
                "occupation": "Other",
                "category": "General",
                "income": 50000,
                "verification_status": "Pending",
                "email": "user@example.com",
                "aadhaar": "0000-0000-0000",
                "state": "Maharashtra"
            }
            store[self.doc_id] = data
        return MockDocument(self.doc_id, data)

    def update(self, data):
        store = self.db_ref.citizens_store if self.collection_name == "citizens" else self.db_ref.fraud_store
        if self.doc_id in store:
            store[self.doc_id].update(data)
            return True
        raise Exception("Document not found")

    def set(self, data, merge=True):
        store = self.db_ref.citizens_store if self.collection_name == "citizens" else self.db_ref.fraud_store
        if self.doc_id in store and merge:
            store[self.doc_id].update(data)
        else:
            store[self.doc_id] = data
        return True

class MockFirestoreClient:
    def __init__(self):
        self.citizens_store = {
            "user_1": {
                "name": "Ramesh Kumar Patil",
                "age": 42,
                "occupation": "Farmer",
                "category": "OBC",
                "income": 45000,
                "verification_status": "Verified",
                "email": "ramesh.patil@example.com",
                "aadhaar": "4532-8812-9011",
                "state": "Maharashtra"
            },
            "user_2": {
                "name": "Priyanka Sunil Shinde",
                "age": 21,
                "occupation": "Student",
                "category": "SC",
                "income": 120000,
                "verification_status": "Pending",
                "email": "priyanka.shinde@example.com",
                "aadhaar": "8812-3204-7711",
                "state": "Maharashtra"
            },
            "user_3": {
                "name": "Anant Ramchandra Joshi",
                "age": 71,
                "occupation": "Senior Citizen",
                "category": "General",
                "income": 18000,
                "verification_status": "Verified",
                "email": "anant.joshi@example.com",
                "aadhaar": "2201-9988-1234",
                "state": "Maharashtra"
            },
            "user_4": {
                "name": "Savita Devidas Pawar",
                "age": 35,
                "occupation": "Self-Employed",
                "category": "ST",
                "income": 65000,
                "verification_status": "Failed",
                "email": "savita.pawar@example.com",
                "aadhaar": "9088-7711-3344",
                "state": "Maharashtra"
            }
        }
        self.fraud_store = {
            "fraud_1": {
                "id": "fraud_1",
                "user_id": "user_2",
                "name": "Priyanka Sunil Shinde",
                "alert_type": "Income Discrepancy",
                "description": "Declared annual income is ₹1,20,000, but ITR data shows ₹9,50,000.",
                "timestamp": "2026-08-01T10:30:00Z",
                "status": "Unresolved"
            },
            "fraud_2": {
                "id": "fraud_2",
                "user_id": "user_4",
                "name": "Savita Devidas Pawar",
                "alert_type": "Aadhaar Lockout",
                "description": "Failed DigiLocker authentication three consecutive times.",
                "timestamp": "2026-07-29T14:15:00Z",
                "status": "Resolved"
            }
        }

    def collection(self, name):
        return MockCollection(name, self)

# Initialize Real Firebase SDK or Fallback to Mock
try:
    if not firebase_admin._apps:
        try:
            # Attempt to use Application Default Credentials (ADC)
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized using ADC.")
        except Exception:
            # Fallback to project ID yojana-sarthi
            firebase_admin.initialize_app(options={'projectId': 'yojana-sarthi'})
            logger.info("Firebase Admin initialized using projectId: yojana-sarthi.")
    
    db = firestore.client()
    logger.info("Firestore client established.")
except Exception as e:
    logger.warning(f"Could not connect to live Firestore: {e}. Running in LOCAL MOCK mode.")
    db = MockFirestoreClient()
    is_mock = True
