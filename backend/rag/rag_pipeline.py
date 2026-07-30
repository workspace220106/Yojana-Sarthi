import json

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

        # 3. Generate response from Gemini
        answer = self.gemini.generate(prompt).strip()

        # 4. Remove markdown if Gemini accidentally returns it
        if answer.startswith("```json"):
            answer = answer.replace("```json", "", 1)

        if answer.startswith("```"):
            answer = answer.replace("```", "", 1)

        if answer.endswith("```"):
            answer = answer[:-3]

        answer = answer.strip()

        # 5. Parse JSON
        try:
            result = json.loads(answer)

        except json.JSONDecodeError:
            result = {
                "citizen_profile": {},
                "eligible": [],
                "ineligible": [],
                "error": "Gemini returned an invalid JSON response.",
                "raw_response": answer
            }

        # 6. Attach metadata
        result["query"] = query
        result["total_schemes"] = len(schemes)

        result["sources"] = [
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

        return result