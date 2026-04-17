from sentence_transformers import SentenceTransformer

# 🔥 Global variable
_model = None


def get_model():
    global _model

    if _model is None:
        print("🔄 Loading embedding model (only once)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")

    return _model


def get_embeddings(texts):
    model = get_model()

    if isinstance(texts, str):
        texts = [texts]

    return model.encode(texts)