from rag.retriever import Retriever

retriever = Retriever()

schemes = retriever.retrieve(
    "Scholarship for engineering students in Maharashtra"
)

for i, scheme in enumerate(schemes, start=1):

    print("=" * 80)
    print(f"Scheme {i}")

    print("Title :", scheme["title"])
    print("Score :", round(scheme["score"], 4))
    print("Department :", scheme["metadata"].get("department"))
    print()

    for section, text in scheme["sections"].items():

        print(f"----- {section} -----")
        print(text[:300])
        print()