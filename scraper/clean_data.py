# TODO: Implement data cleaning pipeline
import json
from pathlib import Path

RAW_FILE = Path("data/raw/maharashtra_schemes_complete.json")
OUTPUT_FILE = Path("data/cleaned/schemes_cleaned.json")


def safe_get(obj, *keys, default=None):
    """Safely navigate nested dictionaries."""
    for key in keys:
        if obj is None:
            return default
        obj = obj.get(key)
    return obj if obj is not None else default


def labels(items):
    if not items:
        return []
    return [
        item.get("label", "")
        for item in items
        if isinstance(item, dict)
    ]


def clean_scheme(record):
    data = record.get("data", {})
    en = data.get("en", {})

    basic = en.get("basicDetails", {})
    content = en.get("schemeContent", {})
    eligibility = en.get("eligibilityCriteria", {})
    application = en.get("applicationProcess", [])
    definitions = en.get("schemeDefinitions", [])

    return {
        "slug": record.get("slug", ""),
        "scheme_name": basic.get("schemeName", ""),
        "short_title": basic.get("schemeShortTitle", ""),
        "implementing_agency": basic.get("implementingAgency"),
        "ministry": safe_get(basic, "nodalMinistryName", "label"),
        "department": safe_get(basic, "nodalDepartmentName", "label"),
        "level": safe_get(basic, "level", "label"),
        "scheme_type": safe_get(basic, "schemeType", "label"),
        "categories": labels(basic.get("schemeCategory")),
        "subcategories": labels(basic.get("schemeSubCategory")),
        "beneficiaries": labels(basic.get("targetBeneficiaries")),
        "tags": basic.get("tags", []),
        "open_date": basic.get("schemeOpenDate"),
        "close_date": basic.get("schemeCloseDate"),
        "description": content.get("detailedDescription_md", ""),
        "brief_description": content.get("briefDescription", ""),
        "benefits": content.get("benefits_md", ""),
        "eligibility": eligibility.get("eligibilityDescription_md", ""),
        "application": [
            step.get("process_md", "")
            for step in application
        ],
        "references": content.get("references", []),
        "definitions": [
            {
                "term": d.get("name"),
                "definition": d.get("definitions_md", "")
            }
            for d in definitions
        ]
    }


def main():
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    cleaned = []

    for record in raw:
        try:
            cleaned.append(clean_scheme(record))
        except Exception as e:
            print("Skipped:", e)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)

    print("=" * 50)
    print(f"Total schemes : {len(cleaned)}")
    print(f"Saved to      : {OUTPUT_FILE}")
    print("=" * 50)


if __name__ == "__main__":
    main()