from rag.rag_pipeline import RAGPipeline

pipeline = RAGPipeline()

while True:
    query = input("\nAsk a question (or type 'exit'): ")

    if query.lower() == "exit":
        break

    result = pipeline.ask(query)

    print("\n================ ANSWER ================\n")
    print(result["answer"])

    print("\n================ SOURCES ================\n")

    for source in result["sources"]:
        print(f"Title         : {source['title']}")
        print(f"Department    : {source['department']}")
        print(f"Level         : {source['level']}")
        print(f"Beneficiaries : {source['beneficiaries']}")
        print(f"Categories    : {source['categories']}")
        print(f"Score         : {source['score']:.4f}")
        print("-" * 50)