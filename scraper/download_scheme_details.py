import json
import time
import requests

SEARCH_FILE = "maharashtra_schemes.json"
OUTPUT_FILE = "maharashtra_schemes_complete.json"

headers = {
    "accept": "application/json, text/plain, */*",
    "origin": "https://www.myscheme.gov.in",
    "referer": "https://www.myscheme.gov.in/",
    "user-agent": "Mozilla/5.0",
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
}

DETAIL_URL = "https://api.myscheme.gov.in/schemes/v6/public/schemes"

with open(SEARCH_FILE, "r", encoding="utf-8") as f:
    schemes = json.load(f)

results = []

for i, scheme in enumerate(schemes, 1):

    slug = scheme["fields"]["slug"]

    print(f"[{i}/{len(schemes)}] {slug}")

    r = requests.get(
        DETAIL_URL,
        headers=headers,
        params={
            "slug": slug,
            "lang": "en"
        }
    )

    if r.status_code == 200:
        results.append(r.json())
    else:
        print("Failed:", slug, r.status_code)

    time.sleep(0.25)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(results)} schemes.")