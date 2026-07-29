from rag.retriever import Retriever
from rag.prompt_builder import PromptBuilder
from rag.gemini_client import GeminiClient

query = "I am an engineering student from Maharashtra. Which scholarships can I apply for?"

retriever = Retriever()
schemes = retriever.retrieve(query)

prompt = PromptBuilder.build(query, schemes)

gemini = GeminiClient()
answer = gemini.generate(prompt)

print(answer)