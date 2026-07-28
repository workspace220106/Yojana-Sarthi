import requests
import json
import time

url = "https://api.myscheme.gov.in/search/v6/schemes"

headers = {
    "accept": "application/json, text/plain, */*",
    "origin": "https://www.myscheme.gov.in",
    "referer": "https://www.myscheme.gov.in/",
    "user-agent": "Mozilla/5.0",
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
}

q = json.dumps([
    {
        "identifier": "beneficiaryState",
        "value": "All"
    },
    {
        "identifier": "beneficiaryState",
        "value": "Maharashtra"
    }
])

all_schemes = []

for page in range(9):        # 85 schemes → 9 pages
    params = {
        "lang": "en",
        "q": q,
        "keyword": "",
        "sort": "",
        "from": page * 10,
        "size": 10
    }

    r = requests.get(url, headers=headers, params=params)
    r.raise_for_status()

    data = r.json()

    items = data["data"]["hits"]["items"]

    all_schemes.extend(items)

    print(f"Downloaded {len(all_schemes)} schemes")

    time.sleep(0.2)

with open("maharashtra_schemes.json", "w", encoding="utf-8") as f:
    json.dump(all_schemes, f, indent=2, ensure_ascii=False)

print("Done!")