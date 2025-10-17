from pathlib import Path
from langchain.vectorstores import FAISS
from langchain_ollama.embeddings import OllamaEmbeddings

from loaders import load_documents_from_folder
from splitter import split_documents
from config import INDEX_DIR, DATA_DIR, OLLAMA_EMBED_MODEL

def build_faiss_index(data_folder: str | Path = None, index_dir: str | Path = None, embed_model: str = None):
    data_folder = data_folder or DATA_DIR
    index_dir = Path(index_dir or INDEX_DIR)

    print('Загрузка документов...')
    docs = load_documents_from_folder(data_folder)
    print(f'Загружено документов: {len(docs)}')

    print('Разбиение на чанки...')
    chunks = split_documents(docs)
    print(f'Получено чанков: {len(chunks)}')

    print('Создание эмбеддингов (Ollama)...')
    emb = OllamaEmbeddings(model=OLLAMA_EMBED_MODEL) if OLLAMA_EMBED_MODEL else OllamaEmbeddings()

    print('Индексирование в FAISS...')
    vectorstore = FAISS.from_documents(chunks, embedding=emb)

    index_dir.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(index_dir))
    print(f'Индекс сохранён в {index_dir}')
    return vectorstore


if __name__ == '__main__':
    build_faiss_index()