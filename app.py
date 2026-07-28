import os
import re
import pickle
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__, static_folder='static')

# Load the processed dataset and ML models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "processed_schemes.csv"))
with open(os.path.join(BASE_DIR, "vectorizer.pkl"), "rb") as f:
    vectorizer = pickle.load(f)
with open(os.path.join(BASE_DIR, "tfidf_matrix.pkl"), "rb") as f:
    tfidf_matrix = pickle.load(f)

# Fill NaNs in text columns to prevent issues
df['scheme_name'] = df['scheme_name'].fillna('')
df['details'] = df['details'].fillna('')
df['benefits'] = df['benefits'].fillna('')
df['eligibility'] = df['eligibility'].fillna('')
df['documents'] = df['documents'].fillna('')
df['application'] = df['application'].fillna('')
df['tags'] = df['tags'].fillna('')
df['schemeCategory'] = df['schemeCategory'].fillna('')

def extract_parameters_from_text(query):
    """
    Extract age, income, occupation, and category from a natural language query.
    """
    if not query:
        return {}
        
    query_lower = query.lower()
    params = {}
    
    # 1. Age Extraction
    # e.g., "60-year-old", "60 years old", "age 60", "age of 60", "i am 60"
    age_patterns = [
        r'\b(\d{1,2})\s*-?year-?old\b',
        r'\b(\d{1,2})\s*years?\s*old\b',
        r'\bage\s*(?:of)?\s*(\d{1,2})\b',
        r'\bi\s*am\s*(\d{1,2})\b',
        r'\baged\s*(\d{1,2})\b'
    ]
    for pattern in age_patterns:
        match = re.search(pattern, query_lower)
        if match:
            params['age'] = int(match.group(1))
            break
            
    # 2. Income Extraction
    # e.g., "income 50000", "earning 2 lakh", "salary is 100000", "income under 1.5 lakhs"
    # Clean commas first in temporary string
    query_clean = re.sub(r'(?<=\d),(?=\d)', '', query_lower)
    
    # Check for Lakhs first (e.g., "1.5 lakh", "8 lakhs")
    lakh_match = re.search(r'\b(\d+(?:\.\d+)?)\s*lakhs?\b', query_clean)
    if lakh_match:
        params['income'] = int(float(lakh_match.group(1)) * 100000)
    else:
        income_patterns = [
            r'(?:income|earning|salary|earn)[^0-9\n]{0,20}(?:rs\.?|₹)?\s*(\d+)',
            r'\b(?:rs\.?|₹)\s*(\d+)\b'
        ]
        for pattern in income_patterns:
            match = re.search(pattern, query_clean)
            if match:
                val = int(match.group(1))
                if val > 1000: # Skip small numbers which are likely ages or classes
                    params['income'] = val
                    break

    # 3. Occupation Extraction
    occ_keywords = {
        'farmer': ['farmer', 'shetkari', 'kisan', 'cultivator', 'agriculture', 'grower', 'farm'],
        'student': ['student', 'learner', 'trainee', 'school', 'college', 'iti', 'education', 'studying'],
        'construction worker': ['construction worker', 'builder', 'labour', 'labourer', 'mason', 'worker', 'mbocww'],
        'unemployed': ['unemployed', 'jobless', 'unemployment'],
        'entrepreneur': ['entrepreneur', 'business owner', 'shopkeeper', 'startup', 'merchant', 'business'],
        'artisan': ['artisan', 'weaver', 'craftsman', 'fisherman', 'cooperative']
    }
    for occ, keywords in occ_keywords.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', query_lower) for kw in keywords):
            params['occupation'] = occ
            break
            
    # 4. Caste Category Extraction
    cat_keywords = {
        'SC': ['sc', 'scheduled caste', 'harijan'],
        'ST': ['st', 'scheduled tribe', 'adivasi'],
        'OBC': ['obc', 'other backward class', 'other backward classes'],
        'VJNT': ['vjnt', 'nomadic tribe', 'nomadic tribes', 'vimukta jati', 'denotified'],
        'SBC': ['sbc', 'special backward class', 'special backward classes'],
        'PwD': ['disabled', 'disability', 'handicapped', 'blind', 'deaf', 'pwd', 'divyang'],
        'BPL': ['bpl', 'below poverty line', 'poor'],
        'Minority': ['minority', 'minorities', 'muslim', 'sikh', 'christian', 'buddhist', 'jain', 'parsi'],
        'General': ['general', 'open category', 'open', 'unreserved']
    }
    for cat, keywords in cat_keywords.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', query_lower) for kw in keywords):
            params['category'] = cat
            break
            
    # 5. Gender Extraction
    if any(re.search(r'\b' + re.escape(w) + r'\b', query_lower) for w in ['female', 'woman', 'women', 'girl', 'girls']):
        params['gender'] = 'Female'
    elif any(re.search(r'\b' + re.escape(w) + r'\b', query_lower) for w in ['male', 'man', 'men', 'boy', 'boys']):
        params['gender'] = 'Male'
        
    return params

def evaluate_eligibility(row, age, income, occupation, category, gender):
    """
    Determine if a profile is eligible for a scheme and return (is_eligible, reasons).
    """
    reasons_failed = []
    reasons_passed = []
    
    # 1. Age check
    if age is not None:
        min_age = int(row['parsed_age_min'])
        max_age = int(row['parsed_age_max'])
        if age < min_age:
            reasons_failed.append(f"Minimum age required is {min_age} years (User age: {age}).")
        elif age > max_age:
            reasons_failed.append(f"Maximum age limit is {max_age} years (User age: {age}).")
        else:
            reasons_passed.append(f"Age {age} is within the required range ({min_age}-{max_age}).")

    # 2. Income check
    if income is not None:
        max_inc = float(row['parsed_income_max'])
        if income > max_inc:
            reasons_failed.append(f"Maximum annual income allowed is ₹{int(max_inc):,} (User income: ₹{income:,}).")
        else:
            if max_inc < 9000000:
                reasons_passed.append(f"Annual income ₹{income:,} is under the limit of ₹{int(max_inc):,}.")
            else:
                reasons_passed.append("No income restriction.")

    # 3. Gender check
    if gender is not None and gender != 'All':
        parsed_gender = str(row['parsed_gender'])
        if parsed_gender != 'All' and parsed_gender != gender:
            reasons_failed.append(f"Scheme is restricted to {parsed_gender} beneficiaries (User: {gender}).")
        else:
            reasons_passed.append(f"Gender criteria matches ({parsed_gender}).")

    # 4. Occupation check
    if occupation is not None and occupation != 'All':
        parsed_occs = str(row['parsed_occupations']).split(',')
        if 'All' not in parsed_occs and occupation not in parsed_occs:
            reasons_failed.append(f"Scheme is restricted to occupations: {', '.join(parsed_occs)} (User: {occupation}).")
        else:
            reasons_passed.append(f"Occupation criteria matches.")

    # 5. Category check
    if category is not None and category != 'All':
        parsed_cats = str(row['parsed_categories']).split(',')
        if 'All' not in parsed_cats and category not in parsed_cats:
            reasons_failed.append(f"Scheme is restricted to categories: {', '.join(parsed_cats)} (User: {category}).")
        else:
            reasons_passed.append(f"Category criteria matches.")

    is_eligible = len(reasons_failed) == 0
    return is_eligible, reasons_failed, reasons_passed

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/schemes', methods=['GET'])
def get_schemes():
    query = request.args.get('query', '')
    
    # Auto-extract parameters from natural language query
    extracted = extract_parameters_from_text(query)
    
    # Use explicitly passed parameters, falling back to extracted ones
    age_str = request.args.get('age', '')
    income_str = request.args.get('income', '')
    occupation = request.args.get('occupation', '')
    category = request.args.get('category', '')
    gender = request.args.get('gender', '')
    
    age = int(age_str) if age_str.isdigit() else extracted.get('age', None)
    
    # Parse income
    if income_str.isdigit():
        income = int(income_str)
    else:
        income = extracted.get('income', None)
        
    if not occupation or occupation == 'undefined':
        occupation = extracted.get('occupation', 'All')
    if not category or category == 'undefined':
        category = extracted.get('category', 'All')
    if not gender or gender == 'undefined':
        gender = extracted.get('gender', 'All')
        
    # Calculate search scores using TF-IDF cosine similarity if query is present
    scores = np.zeros(len(df))
    if query:
        query_vec = vectorizer.transform([query])
        sim_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
        scores = sim_scores

    eligible_schemes = []
    ineligible_schemes = []

    for idx, row in df.iterrows():
        is_eligible, failed_reasons, passed_reasons = evaluate_eligibility(
            row, age, income, occupation, category, gender
        )
        
        scheme_info = {
            'scheme_name': row['scheme_name'],
            'slug': row['slug'],
            'details': row['details'],
            'benefits': row['benefits'],
            'eligibility': row['eligibility'],
            'application': row['application'],
            'documents': row['documents'],
            'schemeCategory': row['schemeCategory'],
            'tags': row['tags'],
            'level': row['level'],
            'relevance_score': float(scores[idx]),
            'passed_reasons': passed_reasons,
            'failed_reasons': failed_reasons
        }
        
        if is_eligible:
            eligible_schemes.append(scheme_info)
        else:
            ineligible_schemes.append(scheme_info)
            
    # Sort eligible schemes:
    # If there's a search query, sort by TF-IDF score descending.
    # Otherwise, sort by scheme name.
    if query:
        eligible_schemes.sort(key=lambda x: x['relevance_score'], reverse=True)
        ineligible_schemes.sort(key=lambda x: x['relevance_score'], reverse=True)
    else:
        eligible_schemes.sort(key=lambda x: x['scheme_name'])
        ineligible_schemes.sort(key=lambda x: x['scheme_name'])

    return jsonify({
        'extracted_params': {
            'age': age,
            'income': income,
            'occupation': occupation,
            'category': category,
            'gender': gender
        },
        'eligible': eligible_schemes,
        'ineligible': ineligible_schemes
    })

if __name__ == '__main__':
    # Run server on port 5001
    print("Starting Flask server on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
