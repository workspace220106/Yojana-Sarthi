import json
from pathlib import Path
from uuid import uuid4
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT = (
    BASE_DIR
    / "data"
    / "cleaned"
    / "maharashtra"
    / "schemes_cleaned.json"
)

OUTPUT = (
    BASE_DIR
    / "data"
    / "chunks"
    / "maharashtra_scheme_chunks.json"
)

OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True
)


def add_chunk(chunks, slug, title, section, text, metadata):
    """
    Adds a chunk if the text is valid.
    """

    if not text:
        return

    if isinstance(text, str):
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


def metadata_to_text(metadata):
    """
    Creates a searchable metadata chunk.
    """

    lines = []

    for key, value in metadata.items():

        if not value:
            continue

        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)

        lines.append(f"{key}: {value}")

    return "\n".join(lines)


def main():

    with open(INPUT, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    chunks = []

    for scheme in schemes:

        slug = scheme["slug"]
        title = scheme["title"]

        metadata = scheme["metadata"]
        sections = scheme["sections"]

        # --------------------------------------------------
        # Metadata Chunk
        # --------------------------------------------------

        add_chunk(
            chunks,
            slug,
            title,
            "Metadata",
            "\n".join([
                f"Scheme Name: {title}",
                f"Department: {metadata.get('department', '')}",
                f"Ministry: {metadata.get('ministry', '')}",
                f"Categories: {', '.join(metadata.get('categories', []))}",
                f"Subcategories: {', '.join(metadata.get('subcategories', []))}",
                f"Beneficiaries: {', '.join(metadata.get('beneficiaries', []))}",
                f"Benefit Type: {', '.join(metadata.get('benefit_type', []))}",
                f"Scheme Type: {metadata.get('scheme_type', '')}",
                f"Level: {metadata.get('level', '')}",
                f"Open Date: {metadata.get('open_date', '')}",
                f"Close Date: {metadata.get('close_date', '')}"
            ]),
            metadata
        )

        # --------------------------------------------------
        # Dynamic Section Chunking
        # --------------------------------------------------

        for section, value in sections.items():

            if isinstance(value, str):

                add_chunk(
                    chunks,
                    slug,
                    title,
                    section,
                    value,
                    metadata
                )

            elif isinstance(value, list):

                for item in value:

                    if isinstance(item, dict):

                        text = "\n".join(
                            f"{k}: {v}"
                            for k, v in item.items()
                            if v
                        )

                    else:

                        text = str(item)

                    add_chunk(
                        chunks,
                        slug,
                        title,
                        section,
                        text,
                        metadata
                    )

            elif isinstance(value, dict):

                text = "\n".join(
                    f"{k}: {v}"
                    for k, v in value.items()
                    if v
                )

                add_chunk(
                    chunks,
                    slug,
                    title,
                    section,
                    text,
                    metadata
                )

            # ----------------------------
            # Dictionary section
            # ----------------------------

            elif isinstance(value, dict):

                text = "\n".join(
                    f"{k}: {v}"
                    for k, v in value.items()
                    if v
                )

                add_chunk(
                    chunks,
                    slug,
                    title,
                    section,
                    text,
                    metadata
                )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(
            chunks,
            f,
            indent=2,
            ensure_ascii=False
        )

    print("=" * 70)
    print("Chunk Generation Complete")
    print("=" * 70)
    print(f"Schemes Processed : {len(schemes)}")
    print(f"Chunks Generated  : {len(chunks)}")
    print(f"Output File       : {OUTPUT}")
    print("=" * 70)


if __name__ == "__main__":
    main()