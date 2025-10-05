from pathlib import Path

DATA_DIR = Path(__file__).parent / 'data' / 'example_docs'

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120

OLLAMA_EMBED_MODEL = 'mxbai-embed-large'
OLLAMA_LLM_MODEL = 'llama3.1:8b'

INDEX_DIR = Path(__file__).parent / 'faiss_index'

TOP_K = 5

ALLOWED_EXTENSIONS = {'.pdf', '.docx'}