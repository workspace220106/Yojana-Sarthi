from collections import defaultdict

from config import TOP_K, MAX_SCHEMES
from rag.vector_store import VectorStore


class Retriever:

    def __init__(self):
        self.vector_store = VectorStore()

    def retrieve(
        self,
        query,
        top_k=TOP_K,
        max_schemes=MAX_SCHEMES
    ):

        chunks = self.vector_store.search(
            query,
            k=top_k
        )

        grouped = defaultdict(lambda: {
            "title": "",
            "slug": "",
            "metadata": {},
            "score": 0.0,
            "sections": {}
        })

        for chunk in chunks:

            title = chunk["title"]

            scheme = grouped[title]

            if scheme["title"] == "":
                scheme["title"] = title
                scheme["slug"] = chunk.get("slug", "")
                scheme["metadata"] = chunk.get("metadata", {})

            scheme["score"] = max(
                scheme["score"],
                chunk["score"]
            )

            scheme["sections"][chunk["section"]] = chunk["text"]

        schemes = sorted(
            grouped.values(),
            key=lambda x: x["score"],
            reverse=True
        )

        return schemes[:max_schemes]