from rag.retriever import Retriever
from rag.prompt_builder import PromptBuilder

query = "Scholarship for engineering students in Maharashtra"

retriever = Retriever()

schemes = retriever.retrieve(query)

prompt = PromptBuilder.build(query, schemes)

print(prompt)