import json
from pathlib import Path

from scraper.website_parser import WebsiteParser
from services.extractor import SchemeExtractor
from scraper.cleaner import SchemeCleaner
from scraper.chunk_generator import ChunkGenerator
from services.embedding_generator import EmbeddingGenerator

RAW_DATA = Path("maharashtra_schemes_complete.json")

CHUNK_OUTPUT = Path("data/chunks/scheme_chunks.json")

EMBEDDING_DIR = Path("data/embeddings")


def main():

    print("=" * 60)
    print("Loading raw schemes...")
    print("=" * 60)

    with open(RAW_DATA, "r", encoding="utf-8") as f:
        raw_schemes = json.load(f)

    parser = WebsiteParser()
    extractor = SchemeExtractor()
    cleaner = SchemeCleaner()
    chunker = ChunkGenerator()
    embedder = EmbeddingGenerator()

    processed = []

    print(f"Total Schemes : {len(raw_schemes)}\n")

    for raw in raw_schemes:

        # Step 1
        scheme = parser.parse(raw)

        # Step 2
        sections = extractor.extract(scheme)

        # Step 3
        sections = cleaner.clean(sections)

        scheme["sections"] = sections

        processed.append(scheme)

    print("Generating chunks...")

    chunks = chunker.generate_chunks(processed)

    chunker.save_chunks(
        chunks,
        CHUNK_OUTPUT
    )

    print(f"Chunks Generated : {len(chunks)}")

    print("\nGenerating embeddings...")

    embeddings = embedder.generate_embeddings(chunks)

    embedder.save(
        chunks,
        embeddings,
        EMBEDDING_DIR
    )

    print("\nDataset Successfully Built!")


if __name__ == "__main__":
    main()