from fastapi import APIRouter, UploadFile, File, Request, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
import shutil
import os

from database import get_db
from models.faq import FAQ

from rag.loader import load_file
from rag.chunker import chunk_text
from rag.embedding import get_embeddings
from rag.vector_store import (
    init_index,
    add_embeddings,
    save_index,
    load_index,
    search
)
from rag.llm import generate_answer


router = APIRouter()

UPLOAD_DIR = "data/documents"


# ==========================================
# FAQ SEARCH HELPER
# ==========================================
def search_faq_context(db, query):
    clean_query = query.strip()

    faqs = db.query(FAQ).filter(
        FAQ.is_active == True,
        or_(
            FAQ.question.ilike(f"%{clean_query}%"),
            FAQ.answer.ilike(f"%{clean_query}%")
        )
    ).limit(3).all()

    return faqs


# ==========================================
# UPLOAD KB DOCUMENT
# ==========================================
@router.post("/kb/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = load_file(file_path)
        chunks = chunk_text(text)
        embeddings = get_embeddings(chunks)

        init_index()
        add_embeddings(embeddings, chunks, file.filename)
        save_index()

        return {
            "message": "Document uploaded and processed successfully",
            "file": file.filename,
            "chunks": len(chunks)
        }

    except Exception as e:
        return {"error": str(e)}


# ==========================================
# HYBRID KB SEARCH (FAQ + RAG)
# ==========================================
@router.post("/kb/search")
async def search_kb(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        body = await request.json()

        # Support both raw string and JSON body
        if isinstance(body, dict):
            query = body.get("query")
        else:
            query = body

        if not query:
            return {"error": "Query is required"}

        # ----------------------------------
        # Handle Greetings
        # ----------------------------------
        import string
        clean_query_no_punct = query.strip().lower().translate(str.maketrans('', '', string.punctuation))
        
        greetings = {
            "hi": "Hello! How can I help you today?",
            "hello": "Hello! How can I assist you today?",
            "how are you": "I am a smart service desk assistant. I'm doing well, thank you! How can I help you?",
            "thank you": "You're very welcome! If you need anything else, feel free to ask.",
            "thankyou": "You're very welcome! If you need anything else, feel free to ask.",
            "thanks": "You're welcome! Let me know if you need anything else."
        }

        if clean_query_no_punct in greetings:
            return {
                "question": query,
                "answer": greetings[clean_query_no_punct],
                "sources": []
            }

        # ----------------------------------
        # 1. Search FAQ Context
        # ----------------------------------
        faq_results = search_faq_context(db, query)

        faq_context = ""

        for faq in faq_results:
            faq_context += f"""
HIGH PRIORITY FAQ:
Question: {faq.question}
Answer: {faq.answer}

"""

        # ----------------------------------
        # 2. Search RAG KB Documents
        # ----------------------------------
        rag_results = []

        if os.path.exists("data/faiss.index"):
            load_index()

            query_embedding = get_embeddings([query])[0]
            rag_results = search(query_embedding, k=3)

        # ----------------------------------
        # 3. No Context Found Anywhere
        # ----------------------------------
        if not faq_results and not rag_results:
            return {
                "question": query,
                "answer": "i dont know the answer, so raise a ticket.",
                "sources": []
            }

        # ----------------------------------
        # 4. Build RAG Context
        # ----------------------------------
        rag_context = "\n\n".join(
            [r["text"] for r in rag_results]
        ) if rag_results else ""

        # ----------------------------------
        # 5. Combine FAQ + KB Context
        # ----------------------------------
        combined_context = f"""
=== FAQ CONTEXT ===
{faq_context}

=== KB DOCUMENT CONTEXT ===
{rag_context}
"""

        # ----------------------------------
        # 6. Generate Final Answer
        # ----------------------------------
        answer = generate_answer(query, combined_context)

        # ----------------------------------
        # 7. Return Response
        # ----------------------------------
        return {
            "question": query,
            "answer": answer,
            "sources": (
                [
                    {
                        "document": "FAQ",
                        "preview": faq.answer[:100]
                    }
                    for faq in faq_results
                ]
                +
                [
                    {
                        "document": r["document"],
                        "preview": r["text"][:100]
                    }
                    for r in rag_results
                ]
            )
        }

    except Exception as e:
        return {"error": str(e)}


# ==========================================
# LIST KB DOCUMENTS
# ==========================================
@router.get("/kb/list")
def list_documents():
    try:
        folder = "data/documents"
        files = os.listdir(folder) if os.path.exists(folder) else []

        return {
            "files": files,
            "count": len(files)
        }

    except Exception as e:
        return {"error": str(e)}


# ==========================================
# DELETE KB DOCUMENT
# ==========================================
@router.delete("/kb/delete/{filename}")
def delete_document(filename: str):
    try:
        file_path = os.path.join("data/documents", filename)

        if os.path.exists(file_path):
            os.remove(file_path)

        from rag.vector_store import rebuild_index
        rebuild_index()

        return {
            "message": f"{filename} deleted and FAISS updated"
        }

    except Exception as e:
        return {"error": str(e)}