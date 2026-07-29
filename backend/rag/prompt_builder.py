class PromptBuilder:

    @staticmethod
    def build(user_query, schemes):
        prompt = f"""
You are Yojana Sarthi, an AI assistant for Government Schemes.

Your job is to answer ONLY using the information provided below.

If the answer is not available, say:
"I couldn't find that information in the available government schemes."

Never make up information.

================ USER QUESTION ================

{user_query}

================ SCHEMES ================

"""

        for i, scheme in enumerate(schemes, start=1):

            prompt += f"\nScheme {i}\n"
            prompt += f"Title: {scheme['title']}\n"

            metadata = scheme.get("metadata", {})

            prompt += f"Department: {metadata.get('department')}\n"
            prompt += f"Level: {metadata.get('level')}\n"

            prompt += "\n"

            for section, text in scheme["sections"].items():
                prompt += f"{section}\n"
                prompt += text
                prompt += "\n\n"

            prompt += "-" * 60 + "\n"

        prompt += """
================ INSTRUCTIONS ================

Answer in simple and professional English.

Rules:

1. Use ONLY the retrieved scheme information.
2. Never invent or assume details.
3. If a field is missing, write:
   "Information not available in the retrieved scheme."
4. Rank the most relevant schemes first.
5. If multiple schemes match, compare them briefly.

For every scheme include:

• Scheme Name
• Description (if available)
• Eligibility
• Benefits
• Required Documents (if available)
• Application Process (if available)

End your answer with a section titled:

Sources

List only the scheme names used.
"""

        return prompt