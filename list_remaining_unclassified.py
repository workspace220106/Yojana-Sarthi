import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_csv('updated_data.csv')
state_df = df[df['level'].astype(str).str.lower() == 'state'].copy()

# List of all Indian state names
states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Puducherry", "Jammu & Kashmir", "Ladakh"
]

# State regex
state_regex = "|".join([r"\b" + s + r"\b" for s in states])

# Maharashtra specific keywords
mh_keywords = [
    r"\bmumbai\b", r"\bpune\b", r"\bnagpur\b", r"\bthane\b", r"\bnashik\b", r"\baurangabad\b",
    r"\bsolapur\b", r"\bamravati\b", r"\bkolhapur\b", r"\bnavi mumbai\b", r"\blatur\b", r"\bakola\b",
    r"\bmhada\b", r"\bcidco\b", r"\bmidc\b", r"\bmsrtc\b", r"\bmmrda\b", r"\bmsbshse\b",
    "Shivaji Maharaj", "Jyotirao Phule", "Savitribai Phule", "Shahu Maharaj", 
    "Yashwantrao Chavan", "Balasaheb Thackeray", "Vilasrao Deshmukh", "Annabhau Sathe",
    "Maharastra", "Maharshtra", "Maharashra", "Mahrashtra", "Maharsthra", "maharashtra"
]
mh_regex = "|".join(mh_keywords)

# Exclude any scheme that matched any state or Maharashtra keyword
any_state_mask = state_df.astype(str).apply(lambda x: x.str.contains(state_regex, case=False, na=False)).any(axis=1)
mh_mask = state_df.astype(str).apply(lambda x: x.str.contains(mh_regex, case=False, na=False)).any(axis=1)

remaining_df = state_df[~any_state_mask & ~mh_mask]

print(f"Remaining unclassified state-level schemes ({len(remaining_df)}):")
for idx, row in remaining_df.iterrows():
    print(f"- Row {idx:4d} | {row['scheme_name']}")
