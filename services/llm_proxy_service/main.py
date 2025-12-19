import uvicorn
import requests
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np

load_dotenv()

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL")
LLM_MODEL = os.getenv("LLM_MODEL")
PROXY_PORT = int(os.getenv("PROXY_PORT"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")

FAISS_INDEX_FILE = "faiss_index.bin"
CONTENT_MAP_FILE = "content_map.json"
MODEL_NAME = "sentence-transformers/distiluse-base-multilingual-cased-v2"
# --------------------

knowledge_base_index = None
knowledge_base_content_map = []
embedding_model = None

app = FastAPI()

@app.on_event("startup")
async def load_knowledge_base():
    global knowledge_base_index, knowledge_base_content_map, embedding_model
    try:
        knowledge_base_index = faiss.read_index(FAISS_INDEX_FILE)
        print(f"FAISS-индекс успешно загружен из {FAISS_INDEX_FILE}")
    except Exception as e:
        print(f"Ошибка при загрузке FAISS-индекса: {e}. Убедитесь, что 'vectorize.py' был запущен.")
        knowledge_base_index = None

    try:
        with open(CONTENT_MAP_FILE, 'r', encoding='utf-8') as f:
            knowledge_base_content_map = json.load(f)
        print(f"Карта контента успешно загружена из {CONTENT_MAP_FILE}")
    except Exception as e:
        print(f"Ошибка при загрузке карты контента: {e}. Убедитесь, что 'vectorize.py' был запущен.")
        knowledge_base_content_map = []

    try:
        embedding_model = SentenceTransformer(MODEL_NAME)
        print(f"Модель эмбеддингов '{MODEL_NAME}' успешно загружена.")
    except Exception as e:
        print(f"Ошибка при загрузке модели эмбеддингов '{MODEL_NAME}': {e}.")
        embedding_model = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def search_knowledge_base(query: str, top_k: int = 3) -> str:
    if knowledge_base_index is None or embedding_model is None or not knowledge_base_content_map:
        print("База знаний или модель эмбеддингов не загружены. Возврат пустого контекста.")
        return ""

    query_embedding = embedding_model.encode([query])
    query_embedding = np.array(query_embedding).astype('float32')

    distances, indices = knowledge_base_index.search(query_embedding, top_k)
    
    retrieved_content = []
    for i in range(top_k):
        if indices[0][i] < len(knowledge_base_content_map):
            content_item = knowledge_base_content_map[indices[0][i]]
            retrieved_content.append(f"Content from {content_item['url']}:\n{content_item['content']}")

    return "\n\n".join(retrieved_content)


@app.post("/chat")
async def chat(request: Request):
    try:
        request_data = await request.json()
        messages = request_data.get("messages", [])
        # 'context' от фронтенда теперь игнорируется
        # context = request_data.get("context", "") 

        if not messages:
            return {"error": "messages поле обязательно"}

        # Извлекаем последний запрос пользователя
        user_query = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_query = msg.get("content", "")
                break
        
        retrieved_context = ""
        if user_query:
            retrieved_context = search_knowledge_base(user_query)

        system_prompt = f"""Ты — продвинутый ИИ-ассистент по сайту. Твоя задача — точно отвечать на вопросы пользователя, основываясь ИСКЛЮЧИТЕЛЬНО на предоставленной ниже информации.

**ПРАВИЛА ИНТЕРПРЕТАЦИИ КОНТЕКСТА:**
1.  **Источник правды об агентах**: Единственным достоверным источником информации о конкретных ИИ-агентах являются страницы с URL, начинающимся на `/agent/`.
2.  **Приоритет**: Когда пользователь просит найти, перечислить или описать агентов, твой ответ должен основываться **только на содержании страниц `/agent/...`**.
3.  **Игнорирование мусора**: Игнорируй бессмысленный текст, странные наборы слов или тестовые данные (например, "AIAIAI", "Кок машинальный", "gay chlen popa"). Не упоминай их в ответе.
4.  **Прочие страницы**: Информацию с других страниц (например, `/articles`, `/`) можно использовать для ответов на общие вопросы, но не для описания конкретных агентов.

**Информация с сайта (контекст для ответа):**
---
{retrieved_context if retrieved_context else "Информация с сайта недоступна или не найдена по запросу."}
---
"""

        final_messages = [
            {"role": "system", "content": system_prompt}
        ] + messages

        ollama_request_data = {
            "model": LLM_MODEL,
            "messages": final_messages,
            "stream": True,
            "think": False
        }

        def response_stream():
            with requests.post(OLLAMA_API_URL, json=ollama_request_data, stream=True) as response:
                response.raise_for_status()
                for chunk in response.iter_lines():
                    if chunk:
                        try:
                            json_chunk = json.loads(chunk.decode('utf-8'))
                            content = json_chunk.get("message", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

        return StreamingResponse(response_stream(), media_type="text/plain")

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    uvicorn.run(app, port=PROXY_PORT)