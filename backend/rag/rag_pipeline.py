from rag.retriever import Retriever
from rag.prompt_builder import PromptBuilder
from rag.gemini_client import GeminiClient


class RAGPipeline:
    def __init__(self):
        self.retriever = Retriever()
        self.gemini = GeminiClient()

    def ask(self, query: str) -> dict:
        # 1. Retrieve relevant schemes
        schemes = self.retriever.retrieve(query)

        # 2. Build prompt
        prompt = PromptBuilder.build(query, schemes)

        # 3. Generate answer
        answer = self.gemini.generate(prompt)

        # 4. Return structured response
        return {
            "query": query,
            "answer": answer,
            "total_schemes": len(schemes),
            "sources": [
                {
                    "title": scheme["title"],
                    "department": scheme["metadata"].get("department"),
                    "level": scheme["metadata"].get("level"),
                    "beneficiaries": scheme["metadata"].get("beneficiaries"),
                    "categories": scheme["metadata"].get("categories"),
                    "score": scheme["score"]
               }
                for scheme in schemes
   ]
}