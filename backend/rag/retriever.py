from collections import defaultdict

from numpy.char import title
from torch import chunk

from config import TOP_K, MAX_SCHEMES
from rag.vector_store import VectorStore


class Retriever:
    def __init__(self):
        self.vector_store = VectorStore()

    def retrieve(self, query, top_k=TOP_K, max_schemes=MAX_SCHEMES):
        chunks = self.vector_store.search(query, k=top_k)

        grouped = defaultdict(lambda: {
            "title": "",
            "slug": "",
            "metadata": {},
            "score": 0,
            "sections": {}
        })

        for chunk in chunks:

            title = chunk["title"]

            if grouped[title]["title"] == "":
               grouped[title]["title"] = title
               grouped[title]["slug"] = chunk.get("slug", "")
               grouped[title]["metadata"] = chunk.get("metadata", {})

            grouped[title]["score"] = max(
                grouped[title]["score"],
                chunk["score"]
       )

            grouped[title]["sections"][chunk["section"]] = chunk["text"]

        schemes = sorted(
            grouped.values(),
            key=lambda x: x["score"],
            reverse=True
        )

        return schemes[:max_schemes]