import json
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]

CHUNK_FILE = (
    BASE_DIR
    / "data"
    / "chunks"
    / "maharashtra_scheme_chunks.json"
)

OUTPUT_DIR = (
    BASE_DIR
    / "data"
    / "embeddings"
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

INDEX_FILE = OUTPUT_DIR / "faiss.index"
METADATA_FILE = OUTPUT_DIR / "chunks_metadata.json"


def main():

    print("=" * 60)
    print("Loading chunks...")
    print("=" * 60)

    with open(CHUNK_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"Chunks Loaded : {len(chunks)}")

    print("\nLoading embedding model...")

    model = SentenceTransformer("all-MiniLM-L6-v2")

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    print("\nGenerating embeddings...\n")

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    embeddings = np.asarray(
        embeddings,
        dtype=np.float32
    )

    print("\nBuilding FAISS Index...")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(dimension)

    index.add(embeddings)

    faiss.write_index(index, str(INDEX_FILE))

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(
            chunks,
            f,
            indent=2,
            ensure_ascii=False
        )

    print("\n" + "=" * 60)
    print("Embedding Generation Complete")
    print("=" * 60)
    print(f"Vectors       : {index.ntotal}")
    print(f"Dimension     : {dimension}")
    print(f"FAISS Index   : {INDEX_FILE}")
    print(f"Metadata File : {METADATA_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()