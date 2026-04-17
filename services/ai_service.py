import os
from groq import Groq
import PyPDF2
import docx
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -----------------------------
# 📄 Extract text from file
# -----------------------------
def extract_text(file_path: str) -> str:
    text = ""

    if file_path.endswith(".pdf"):
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() or ""

    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"

    else:
        text = "Unsupported file format"

    return text.strip()


# -----------------------------
# 🤖 AI Analysis using Groq
# -----------------------------
def analyze_text(text: str):
    prompt = f"""
You are an AI support assistant.

Analyze the issue and return:
1. Short summary (2 lines)
2. Category (IT / HR / Facility)
3. Priority (Low / Medium / High)

Rules:
- IT: login, system, VPN, software
- HR: leave, salary, policy
- Facility: AC, electricity, maintenance

Issue:
{text}

Return ONLY JSON:
{{
  "summary": "...",
  "category": "...",
  "priority": "..."
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    output = response.choices[0].message.content

    try:
        data = json.loads(output)
        return data["summary"], data["category"], data["priority"]
    except:
        return "Summary not available", "IT", "Low"


# -----------------------------
# 🔥 MAIN FUNCTION
# -----------------------------
def process_ticket(
    file_path: str = None,
    subject: str = "",
    description: str = ""
):
    text = ""

    # If file uploaded → extract text
    if file_path:
        text = extract_text(file_path)

    # Always include subject + description
    combined_text = f"""
Subject:
{subject}

Description:
{description}

Attachment Content:
{text}
""".strip()

    if not combined_text.strip():
        return "No content found", "IT", "Low"

    summary, category, priority = analyze_text(combined_text)

    return summary, category, priority