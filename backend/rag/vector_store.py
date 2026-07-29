from pathlib import Path
import json

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parents[2]
EMBEDDING_DIR = BASE_DIR / "data" / "embeddings"


class VectorStore:
    def __init__(self):
        self.index = faiss.read_index(str(EMBEDDING_DIR / "faiss.index"))

        with open(
            EMBEDDING_DIR / "chunks_metadata.json",
            "r",
            encoding="utf-8",
        ) as f:
            self.metadata = json.load(f)

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def search(self, query, k=5):
        embedding = self.model.encode(
            [query],
            normalize_embeddings=True,
        ).astype(np.float32)

        scores, indices = self.index.search(embedding, k)

        results = []

        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue

            chunk = self.metadata[idx].copy()
            chunk["score"] = float(score)
            results.append(chunk)

        return results