from rag.vector_store import VectorStore

store = VectorStore()

results = store.search(
    "Scholarship for engineering students in Maharashtra",
    k=5
)

for i, result in enumerate(results, start=1):
    print("=" * 70)
    print(f"Result {i}")
    print(f"Score      : {result['score']:.4f}")
    print(f"Title      : {result['title']}")
    print(f"Section    : {result['section']}")
    print(f"Department : {result['metadata']['department']}")
    print(f"Level      : {result['metadata']['level']}")
    print("\nText:")
    print(result["text"][:500] + "...")
    print()