import pandas as pd
import numpy as np
import re
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

def clean_and_merge_datasets():
    print("Loading datasets...")
    # Load maharashtra_schemes.csv
    mh_csv_path = "maharashtra_schemes.csv"
    all_csv_path = "updated_data.csv"
    
    mh_df = pd.read_csv(mh_csv_path)
    all_df = pd.read_csv(all_csv_path)
    
    print(f"Loaded {len(mh_df)} schemes from maharashtra_schemes.csv")
    print(f"Loaded {len(all_df)} schemes from updated_data.csv")
    
    # Filter updated_data.csv for Central and Maharashtra schemes
    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
        "Kerala", "Madhya Pradesh", "Manipur", "Meghalaya", "Mizoram", 
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Delhi", "Puducherry", "Jammu & Kashmir", "Ladakh"
    ]
    state_regex = "|".join([r"\b" + re.escape(s) + r"\b" for s in states])
    mh_regex = r"maharashtra|mumbai|pune|nagpur|thane|nashik|aurangabad|solapur|kolhapur|latur|akola|mhada|cidco|midc|msrtc|maharastra|maharshtra|mahrashtra"
    
    filtered_all = []
    for idx, row in all_df.iterrows():
        level = str(row['level']).strip().lower()
        if level == 'central':
            filtered_all.append(row)
            continue
            
        # Check if it is a Maharashtra state scheme
        # We check if Maharashtra words are in it, AND no other state name is matched
        text = str(row['scheme_name']) + " " + str(row['details']) + " " + str(row['eligibility'])
        has_other_state = re.search(state_regex, text, re.IGNORECASE) is not None
        has_mh = re.search(mh_regex, text, re.IGNORECASE) is not None
        
        # If it doesn't match other states, or explicitly matches Maharashtra, include it
        if has_mh or not has_other_state:
            filtered_all.append(row)
            
    filtered_all_df = pd.DataFrame(filtered_all)
    print(f"Filtered {len(filtered_all_df)} relevant schemes from updated_data.csv")
    
    # Combine the datasets
    combined = pd.concat([mh_df, filtered_all_df], ignore_index=True)
    
    # Deduplicate by slug or scheme_name
    combined['slug'] = combined['slug'].fillna('').astype(str).str.strip()
    combined['scheme_name_clean'] = combined['scheme_name'].astype(str).str.lower().str.strip()
    
    # Prioritize rows that have fewer NaNs or are from maharashtra_schemes.csv
    # We can drop duplicates based on scheme_name_clean, keeping the first occurrence
    # Sort so that rows from maharashtra_schemes.csv come first
    combined['source'] = ['mh_csv' if idx < len(mh_df) else 'all_csv' for idx in range(len(combined))]
    combined = combined.sort_values(by='source', ascending=False) # 'mh_csv' is alphabetically after 'all_csv'
    combined = combined.drop_duplicates(subset=['scheme_name_clean'], keep='first')
    combined = combined.drop(columns=['scheme_name_clean', 'source'])
    
    print(f"Total deduplicated schemes in database: {len(combined)}")
    return combined

def parse_age(text):
    text = str(text).lower()
    between_match = re.search(r'between\s+(\d+)\s+and\s+(\d+)', text)
    if between_match:
        return int(between_match.group(1)), int(between_match.group(2))
    
    to_match = re.search(r'\b(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years|yr|age)', text)
    if to_match:
        return int(to_match.group(1)), int(to_match.group(2))
    
    min_match = re.search(r'(?:minimum|min|at least|above|>|>=)\s*(\d+)', text)
    if min_match:
        # e.g., minimum 18 years
        val = int(min_match.group(1))
        # Ensure it's a realistic age (not class 10th or marks 75%)
        if val < 100:
            return val, None
        
    max_match = re.search(r'(?:maximum|max|up to|less than|not exceed|under|<|<=)\s*(\d+)', text)
    if max_match:
        val = int(max_match.group(1))
        if val < 100:
            return None, val
        
    return None, None

def parse_income(text):
    text = str(text).lower()
    text_clean = re.sub(r'(?<=\d),(?=\d)', '', text)
    
    income_match = re.search(r'(?:income|earning|salary)[^0-9\n]{0,30}(?:rs\.?|₹)?\s*(\d+)', text_clean)
    if income_match:
        val = int(income_match.group(1))
        if val > 1000: # ignore very small amounts which might be stipends
            return val
            
    # Check for Lakhs
    lakh_match = re.search(r'\b(\d+(?:\.\d+)?)\s*lakh', text_clean)
    if lakh_match:
        return int(float(lakh_match.group(1)) * 100000)
        
    num_match = re.search(r'(?:limit|exceed|under|max|maximum|up to|below)[^0-9\n]{0,20}(?:rs\.?|₹)?\s*(\d{5,7})\b', text_clean)
    if num_match:
        return int(num_match.group(1))
        
    return None

def parse_gender(text):
    text = str(text).lower()
    has_female = 'female' in text or 'girl' in text or 'women' in text or 'woman' in text
    has_male = False
    if re.search(r'\bmale\b|\bmales\b|\bboy\b|\bboys\b|\bman\b|\bmen\b', text):
        has_male = True
        
    if has_female and has_male:
        return 'All'
    elif has_female:
        return 'Female'
    elif has_male:
        return 'Male'
    return 'All'

def parse_occupations(text):
    text = str(text).lower()
    occupations = []
    occ_keywords = {
        'farmer': ['farmer', 'shetkari', 'cultivator', 'plantation', 'agriculture', 'horticulture', 'farm pond', 'crop'],
        'student': ['student', 'trainee', 'scholarship', 'iti', 'college', 'school', 'marksheet', 'studying', 'education', 'academic', 'degree', 'diploma'],
        'construction worker': ['construction worker', 'building worker', 'labourer', 'labour', 'construction', 'mbocww'],
        'unemployed': ['unemployed', 'jobless', 'unemployment'],
        'entrepreneur': ['entrepreneur', 'self-employed', 'business', 'start-up', 'venture', 'shopkeeper', 'industry', 'micro, small', 'msme', 'powerloom'],
        'artisan': ['artisan', 'weaver', 'handicraft', 'craftsman', 'fisherman', 'co-operative'],
    }
    for occ, keywords in occ_keywords.items():
        if any(kw in text for kw in keywords):
            occupations.append(occ)
    return occupations if occupations else ['All']

def parse_categories(text):
    text = str(text).lower()
    categories = []
    cat_keywords = {
        'SC': ['sc', 'scheduled caste', 'scheduled castes'],
        'ST': ['st', 'scheduled tribe', 'scheduled tribes'],
        'OBC': ['obc', 'other backward class', 'other backward classes'],
        'VJNT': ['vjnt', 'nomadic tribe', 'nomadic tribes', 'freed caste', 'vimukta jati', 'vimukta jatis'],
        'SBC': ['sbc', 'special backward class', 'special backward caste', 'special backward classes'],
        'PwD': ['disabled', 'disability', 'handicapped', 'blind', 'deaf', 'pwd', 'orthopedically'],
        'BPL': ['bpl', 'below poverty line', 'poverty line', 'economically weaker', 'ews', 'economically backward'],
        'Minority': ['minority', 'minorities', 'muslim', 'christian', 'sikh', 'buddhist', 'parsi', 'jain'],
        'General': ['open category', 'general category', 'general', 'unreserved']
    }
    for cat, keywords in cat_keywords.items():
        if any(kw in text for kw in keywords):
            categories.append(cat)
    return categories if categories else ['All']

def train_and_save_pipeline():
    # 1. Merge datasets
    df = clean_and_merge_datasets()
    
    # 2. Extract structured fields
    print("Extracting structured eligibility parameters...")
    age_mins = []
    age_maxs = []
    income_maxs = []
    genders = []
    occupations_list = []
    categories_list = []
    
    for idx, row in df.iterrows():
        elig_text = str(row['eligibility']) + " " + str(row['details'])
        
        # Parse age
        amin, amax = parse_age(elig_text)
        age_mins.append(amin if amin is not None else 0)
        age_maxs.append(amax if amax is not None else 100)
        
        # Parse income
        inc = parse_income(elig_text)
        # Some default mappings if none found but BPL mentioned
        if inc is None and ('bpl' in elig_text or 'below poverty line' in elig_text):
            inc = 100000 # typical BPL threshold
        income_maxs.append(inc if inc is not None else 9999999) # 9.9M for no limit
        
        # Parse gender
        genders.append(parse_gender(elig_text))
        
        # Parse occupation
        occupations_list.append(",".join(parse_occupations(elig_text)))
        
        # Parse category
        categories_list.append(",".join(parse_categories(elig_text)))
        
    df['parsed_age_min'] = age_mins
    df['parsed_age_max'] = age_maxs
    df['parsed_income_max'] = income_maxs
    df['parsed_gender'] = genders
    df['parsed_occupations'] = occupations_list
    df['parsed_categories'] = categories_list
    
    # 3. Train TF-IDF vectorizer
    print("Training TF-IDF Vectorizer...")
    # Combine relevant textual fields for search index
    df['search_text'] = (
        df['scheme_name'].fillna('') + " " +
        df['details'].fillna('') + " " +
        df['benefits'].fillna('') + " " +
        df['eligibility'].fillna('') + " " +
        df['tags'].fillna('') + " " +
        df['schemeCategory'].fillna('')
    )
    
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(df['search_text'])
    
    # 4. Save artifacts
    print("Saving processed dataset and ML models...")
    df.to_csv("processed_schemes.csv", index=False)
    
    with open("vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)
        
    with open("tfidf_matrix.pkl", "wb") as f:
        pickle.dump(tfidf_matrix, f)
        
    print("Training and preprocessing pipeline completed successfully!")

if __name__ == "__main__":
    train_and_save_pipeline()
