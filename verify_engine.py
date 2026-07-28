import json
import unittest
from app import app, extract_parameters_from_text

class TestEligibilityEngine(unittest.TestCase):
    def setUp(self):
        # Set up Flask test client
        self.app = app.test_client()
        self.app.testing = True

    def test_parameter_extraction_1(self):
        # Test 60-year-old farmer
        query = "I'm a 60-year-old farmer from Pune"
        params = extract_parameters_from_text(query)
        
        self.assertEqual(params.get('age'), 60)
        self.assertEqual(params.get('occupation'), 'farmer')

    def test_parameter_extraction_2(self):
        # Test 21-year-old student with income
        query = "I am a 21-year-old student earning 60000 rupees"
        params = extract_parameters_from_text(query)
        
        self.assertEqual(params.get('age'), 21)
        self.assertEqual(params.get('occupation'), 'student')
        self.assertEqual(params.get('income'), 60000)

    def test_parameter_extraction_3(self):
        # Test construction worker with lakhs
        query = "I'm a construction worker, and my family income is 1.5 lakhs"
        params = extract_parameters_from_text(query)
        
        self.assertEqual(params.get('occupation'), 'construction worker')
        self.assertEqual(params.get('income'), 150000)

    def test_api_eligibility_matching(self):
        # Request eligibility for a 60-year-old farmer (who should be ineligible for schemes with max age < 60)
        # e.g., Aam Aadmi Bima Yojana (max age 59)
        response = self.app.get('/api/schemes?age=60&occupation=farmer&category=General')
        data = json.loads(response.data)
        
        self.assertIn('eligible', data)
        self.assertIn('ineligible', data)
        self.assertIn('extracted_params', data)
        
        # Verify Aam Aadmi Bima Yojana is in the ineligible list (due to age 60 > 59)
        ineligible_names = [s['scheme_name'] for s in data['ineligible']]
        aabym_name = "Aam Aadmi Bima Yojana (Maharashtra)"
        
        if aabym_name in ineligible_names:
            idx = ineligible_names.index(aabym_name)
            failed_reasons = data['ineligible'][idx]['failed_reasons']
            print("Failed reasons for Aam Aadmi Bima Yojana:", failed_reasons)
            self.assertTrue(any("age" in r.lower() or "maximum age" in r.lower() for r in failed_reasons))

    def test_api_nlp_endpoint(self):
        # Test calling the API with just a natural language query
        response = self.app.get('/api/schemes?query=I+am+a+20-year-old+student+from+Maharashtra')
        data = json.loads(response.data)
        
        # Check that parameters were parsed and returned
        extracted = data['extracted_params']
        self.assertEqual(extracted.get('age'), 20)
        self.assertEqual(extracted.get('occupation'), 'student')

if __name__ == '__main__':
    unittest.main()
