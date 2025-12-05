import uvicorn
import requests
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

OLLAMA_API_URL = os.getenv("OLLAMA_API_URL")
LLM_MODEL = os.getenv("LLM_MODEL")
PROXY_PORT = int(os.getenv("PROXY_PORT"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    try:
        request_data = await request.json()
        messages = request_data.get("messages", [])
        context = request_data.get("context", "")

        if not messages:
            return {"error": "messages поле обязательно"}

        system_prompt = f"""Ты — полезный ассистент по сайту. Отвечай на вопрос пользователя, основываясь ИСКЛЮЧИТЕЛЬНО на предоставленном "Контексте страницы". Если ответа нет в контексте, четко скажи, 
что не можешь найти информацию на этой странице. Не используй свои общие знания.

Контекст страницы:
---
{context}
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