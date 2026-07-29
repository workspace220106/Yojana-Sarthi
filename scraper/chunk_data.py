# TODO: Implement data chunking for RAG pipeline
import json
from pathlib import Path
from uuid import uuid4

INPUT = Path("data/cleaned/schemes_cleaned.json")
OUTPUT = Path("data/chunks/scheme_chunks.json")


def add_chunk(chunks, slug, title, section, text, metadata):
    if not text:
        return

    text = text.strip()

    if len(text) < 20:
        return

    chunks.append({
        "id": str(uuid4()),
        "slug": slug,
        "title": title,
        "section": section,
        "text": text,
        "metadata": metadata
    })


def main():

    with open(INPUT, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    chunks = []

    for scheme in schemes:

        metadata = {
            "categories": scheme["categories"],
            "subcategories": scheme["subcategories"],
            "beneficiaries": scheme["beneficiaries"],
            "tags": scheme["tags"],
            "ministry": scheme["ministry"],
            "department": scheme["department"],
            "level": scheme["level"]
        }

        slug = scheme["slug"]
        title = scheme["scheme_name"]

        add_chunk(
            chunks,
            slug,
            title,
            "Description",
            scheme["description"],
            metadata
        )

        add_chunk(
            chunks,
            slug,
            title,
            "Benefits",
            scheme["benefits"],
            metadata
        )

        add_chunk(
            chunks,
            slug,
            title,
            "Eligibility",
            scheme["eligibility"],
            metadata
        )

        for process in scheme["application"]:
            add_chunk(
                chunks,
                slug,
                title,
                "Application",
                process,
                metadata
            )

        for definition in scheme["definitions"]:

            text = f"""
Definition:
{definition['term']}

{definition['definition']}
"""

            add_chunk(
                chunks,
                slug,
                title,
                "Definition",
                text,
                metadata
            )

    OUTPUT.parent.mkdir(exist_ok=True)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    print("=" * 60)
    print("Chunking Complete")
    print("Total Chunks :", len(chunks))
    print("Saved :", OUTPUT)
    print("=" * 60)


if __name__ == "__main__":
    main()