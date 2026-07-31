import requests
import json
import time
from pathlib import Path
DOWNLOAD_MODE = "maharashtra"

URL = "https://api.myscheme.gov.in/search/v6/schemes"

HEADERS = {
    "accept": "application/json, text/plain, */*",
    "origin": "https://www.myscheme.gov.in",
    "referer": "https://www.myscheme.gov.in/",
    "user-agent": "Mozilla/5.0",
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
}

if DOWNLOAD_MODE == "maharashtra":

    q = json.dumps([
        {
            "identifier": "beneficiaryState",
            "value": "Maharashtra"
        }
    ])

else:

    q = json.dumps([
        {
            "identifier": "beneficiaryState",
            "value": "All"
        }
    ])

all_schemes = []

page = 0

while True:

    params = {
        "lang": "en",
        "q": q,
        "keyword": "",
        "sort": "",
        "from": page * 10,
        "size": 10
    }

    try:

        r = requests.get(
            URL,
            headers=HEADERS,
            params=params,
            timeout=30
        )

        r.raise_for_status()

        data = r.json()

        items = data["data"]["hits"]["items"]

        if not items:
            break

        all_schemes.extend(items)

        print(f"Downloaded {len(all_schemes)} schemes")

        page += 1

        time.sleep(0.25)

    except Exception as e:

        print(f"Error on page {page}: {e}")

        break

BASE_DIR = Path(__file__).resolve().parents[1]

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "raw"
    / "maharashtra"
    / "maharashtra_schemes.json"
)

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        all_schemes,
        f,
        indent=2,
        ensure_ascii=False
    )

print("\n======================================")
print(f"Downloaded {len(all_schemes)} schemes")
print("Saved -> maharashtra_schemes.json")
print("======================================")