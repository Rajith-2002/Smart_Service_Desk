import faiss
import numpy as np
import pickle
import os

INDEX_PATH = "data/faiss.index"
META_PATH = "data/metadata.pkl"

index = None
metadata_store = []


def init_index(dim=384):
    global index

    if os.path.exists(INDEX_PATH):
        load_index()
    else:
        index = faiss.IndexFlatL2(dim)


def add_embeddings(embeddings, chunks, doc_name):
    global index, metadata_store

    vectors = np.array(embeddings).astype("float32")
    index.add(vectors)

    for chunk in chunks:
        metadata_store.append({
            "text": chunk,
            "document": doc_name
        })


def save_index():
    global index, metadata_store

    faiss.write_index(index, INDEX_PATH)

    with open(META_PATH, "wb") as f:
        pickle.dump(metadata_store, f)


def load_index():
    global index, metadata_store

    index = faiss.read_index(INDEX_PATH)

    with open(META_PATH, "rb") as f:
        metadata_store = pickle.load(f)


def search(query_embedding, k=3, threshold=2.0):   # Increased threshold to let the LLM filter chunks
    D, I = index.search(
        np.array([query_embedding]).astype("float32"),
        k
    )

    results = []

    for dist, idx in zip(D[0], I[0]):
        print("DIST:", dist)  # 👈 debug

        if dist < threshold:
            results.append(metadata_store[idx])

    return results

import os
from rag.loader import load_file
from rag.chunker import chunk_text
from rag.embedding import get_embeddings

def rebuild_index():
    global index, metadata_store

    print("🔄 Rebuilding FAISS...")

    # reset memory
    index = None
    metadata_store = []

    # correct paths
    index_path = "data/faiss.index"
    meta_path = "data/metadata.pkl"
    folder = "data/documents"

    # delete old index
    if os.path.exists(index_path):
        os.remove(index_path)

    if os.path.exists(meta_path):
        os.remove(meta_path)

    # re-init index
    init_index()

    # 🔥 IMPORTANT: check if documents exist
    if not os.listdir(folder):
        print("⚠ No documents found. Empty index created.")
        save_index()
        return

    # rebuild from remaining docs
    for file in os.listdir(folder):
        path = os.path.join(folder, file)

        print("Processing:", file)

        text = load_file(path)
        chunks = chunk_text(text)
        embeddings = get_embeddings(chunks)

        add_embeddings(embeddings, chunks, file)

    save_index()

    print("✅ FAISS rebuild complete")