from langchain_ollama.embeddings import OllamaEmbeddings
from config import OLLAMA_EMBED_MODEL


def get_ollama_embeddings(model_name: str = None):
    model = OLLAMA_EMBED_MODEL
    emb = OllamaEmbeddings(model=model)
    return emb