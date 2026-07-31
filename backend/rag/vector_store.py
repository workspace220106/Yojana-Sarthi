from pathlib import Path
import json

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parents[2]
EMBEDDING_DIR = BASE_DIR / "data" / "embeddings"


class VectorStore:

    def __init__(self):

        self.index = faiss.read_index(
            str(EMBEDDING_DIR / "faiss.index")
        )

        with open(
            EMBEDDING_DIR / "chunks_metadata.json",
            "r",
            encoding="utf-8",
        ) as f:
            self.metadata = json.load(f)

        # MUST MATCH THE MODEL USED TO BUILD FAISS
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed_query(self, query):

        return self.model.encode(
            [query],
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        ).astype(np.float32)

    def search(self, query, k=20):

        embedding = self.embed_query(query)

        scores, indices = self.index.search(
            embedding,
            k
        )

        results = []

        for score, idx in zip(scores[0], indices[0]):

            if idx == -1:
                continue

            chunk = self.metadata[idx].copy()
            chunk["score"] = float(score)

            results.append(chunk)

        return results

    def metadata_filter(
        self,
        chunks,
        state=None,
        occupation=None,
        category=None,
    ):

        filtered = []

        for chunk in chunks:

            metadata = chunk.get("metadata", {})

            valid = True

            if state:
                states = metadata.get("states_allowed", [])
                if states and state not in states:
                    valid = False

            if occupation:
                occupations = metadata.get("occupation", [])
                if occupations and occupation not in occupations:
                    valid = False

            if category:
                categories = metadata.get("category", [])
                if categories and category not in categories:
                    valid = False

            if valid:
                filtered.append(chunk)

        return filtered