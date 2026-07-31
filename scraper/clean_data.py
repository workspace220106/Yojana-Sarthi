import json
from pathlib import Path
import traceback

BASE_DIR = Path(__file__).resolve().parents[1]

RAW_FILE = (
    BASE_DIR
    / "data"
    / "raw"
    / "maharashtra"
    / "maharashtra_schemes_complete.json"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "cleaned"
    / "maharashtra"
    / "schemes_cleaned.json"
)

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


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

    metadata = {
        "scheme_id": safe_get(data, "_id", default=""),

        # MyScheme doesn't expose a separate scheme_code
        "scheme_code": basic.get("schemeShortTitle", ""),
        "scheme_name": basic.get("schemeName", ""),
        "short_title": basic.get("schemeShortTitle", ""),
        "implementing_agency": basic.get("implementingAgency", ""),
        "department": safe_get(basic, "nodalDepartmentName", "label"),
        "ministry": safe_get(basic, "nodalMinistryName", "label"),
        "level": safe_get(basic, "level", "label"),
        "scheme_type": safe_get(basic, "schemeType", "label"),
        "categories": labels(basic.get("schemeCategory")),
        "subcategories": labels(basic.get("schemeSubCategory")),
        "beneficiaries": labels(basic.get("targetBeneficiaries")),
        "tags": basic.get("tags", []),
        "benefit_type": safe_get(
            content,
            "benefitTypes",
            "label"
        ),
        "open_date": basic.get("schemeOpenDate"),
        "close_date": basic.get("schemeCloseDate"),
        "state": safe_get(basic, "state", "label"),
        "source": "MyScheme",
        "source_url": f"https://www.myscheme.gov.in/schemes/{record.get('slug','')}"
    }

    sections = {

        "Brief Description": content.get("briefDescription", ""),

        "Description": content.get("detailedDescription_md", ""),

        "Benefits": content.get("benefits_md", ""),

        "Eligibility": eligibility.get("eligibilityDescription_md", ""),

        "Exclusions": "\n".join(
            str(item)
            if not isinstance(item, dict)
            else json.dumps(item, ensure_ascii=False)
            for item in content.get("exclusions", [])
        ),

        "Application Process": "\n\n".join(
            step.get("process_md", "")
            for step in application
            if step.get("process_md")
        ),

        "Application URL": "\n".join(
            step.get("url", "")
            for step in application
            if step.get("url")
        ),

        "Definitions": "\n\n".join(
            f"{d.get('name','')}\n{d.get('definitions_md','')}"
            for d in definitions
        ),

        "References": "\n".join(
            f"{r.get('title','')} : {r.get('url','')}"
            for r in content.get("references", [])
        )
    }

    # Remove empty sections
    sections = {
        key: value
        for key, value in sections.items()
        if value
    }

    return {
        "slug": safe_get(data, "slug", default=""),
        "title": basic.get("schemeName", ""),
        "metadata": metadata,
        "sections": sections
    }


def main():
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    cleaned = []

    for record in raw:
        try:
            cleaned.append(clean_scheme(record))

        except Exception:

            traceback.print_exc()

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)

    print("=" * 50)
    print(f"Total schemes : {len(cleaned)}")
    print(f"Saved to      : {OUTPUT_FILE}")
    print("=" * 50)


if __name__ == "__main__":
    main()