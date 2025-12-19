import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os
import re

INPUT_FILE = "knowledge_base.json"
FAISS_INDEX_FILE = "faiss_index.bin"
CONTENT_MAP_FILE = "content_map.json"
MODEL_NAME = "sentence-transformers/distiluse-base-multilingual-cased-v2"
CHUNK_SIZE = 256
CHUNK_OVERLAP = 32
# --------------------

def chunk_text(text, size, overlap):
    words = re.split(r'\s+', text)
    chunks = []
    for i in range(0, len(words), size - overlap):
        chunk = ' '.join(words[i:i + size])
        chunks.append(chunk)
    return chunks

def create_and_save_vector_db(data):
    if not data:
        print("Нет данных для векторизации. Проверьте knowledge_base.json.")
        return

    print(f"Загрузка модели SentenceTransformer: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    print("Модель загружена.")

    all_chunks = []
    content_map = []

    print("Разбиение текста на чанки...")
    for item in data:
        url = item["url"]
        content = item["content"]
        chunks = chunk_text(content, CHUNK_SIZE, CHUNK_OVERLAP)
        
        for chunk in chunks:
            all_chunks.append(chunk)
            content_map.append({"url": url, "content": chunk})
    
    if not all_chunks:
        print("Не удалось создать чанки из текста.")
        return

    print(f"Создано {len(all_chunks)} чанков.")

    print(f"Генерация эмбеддингов для {len(all_chunks)} чанков...")
    embeddings = model.encode(all_chunks, show_progress_bar=True)
    embeddings = np.array(embeddings).astype('float32')
    print("Эмбеддинги сгенерированы.")

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    print(f"FAISS-индекс создан и содержит {index.ntotal} элементов.")

    try:
        faiss.write_index(index, FAISS_INDEX_FILE)
        print(f"FAISS-индекс сохранен в {FAISS_INDEX_FILE}")
    except Exception as e:
        print(f"Ошибка при сохранении FAISS-индекса: {e}")
        return

    try:
        with open(CONTENT_MAP_FILE, 'w', encoding='utf-8') as f:
            json.dump(content_map, f, ensure_ascii=False, indent=4)
        print(f"Карта контента сохранена в {CONTENT_MAP_FILE}")
    except IOError as e:
        print(f"Ошибка при записи карты контента в {CONTENT_MAP_FILE}: {e}")

def main():
    print("Запуск создания векторной базы данных...")
    
    if not os.path.exists(INPUT_FILE):
        print(f"Ошибка: Файл '{INPUT_FILE}' не найден. Пожалуйста, сначала запустите scrape.py.")
        return

    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Загружено {len(data)} элементов из '{INPUT_FILE}'.")
    except Exception as e:
        print(f"Произошла непредвиденная ошибка при чтении файла: {e}")
        return

    create_and_save_vector_db(data)
    print("Процесс создания векторной базы данных завершен.")

if __name__ == "__main__":
    main()
