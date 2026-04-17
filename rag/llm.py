import requests
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def generate_answer(query, context):
    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are a reliable internal Smart Service Desk assistant for HR, IT, and Facilities topics.

- Answer the user's question using ONLY the provided context.
- The context may contain FAQ and Knowledge Base information.
- Prefer FAQ information when directly relevant.
- Use KB document information for additional support.
- Combine information naturally when needed.
- DO NOT mention phrases like:
  "According to FAQ"
  "According to KB"
  "Based on the provided context"
  "According to the knowledge base"
  or reference internal source sections.
- Respond as if you inherently know the answer.
- Provide clear and concise answers.
- If the answer is not present in the context, output EXACTLY:
"i dont know the answer, so raise a ticket."
- Do NOT use external knowledge.
- Do NOT apologize.

Context:
{context}

Question:
{query}
"""

    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=data)

    print("STATUS:", response.status_code)
    print("RAW RESPONSE:", response.text)

    result = response.json()

    if "choices" not in result:
        return f"Groq Error: {result}"

    return result["choices"][0]["message"]["content"]