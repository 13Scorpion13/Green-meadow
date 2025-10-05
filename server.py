from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from pathlib import Path
import uvicorn
import shutil

from indexer import build_faiss_index
from qa_agent import QAAgent
from config import INDEX_DIR, DATA_DIR, ALLOWED_EXTENSIONS

app = FastAPI(title='ИИ-архивариус API')

_agent = None

class IndexRequest(BaseModel):
    data_folder: str

class QueryRequest(BaseModel):
    query: str


@app.post('/index')
async def index(req: IndexRequest):
    global _agent
    folder = Path(req.data_folder)
    if not folder.exists():
        raise HTTPException(status_code=400, detail='Папка не найдена')
    try:
        build_faiss_index(data_folder=folder, index_dir=INDEX_DIR)
        if _agent is not None:
            _agent.reload_index()
        return {'status': 'ok', 'index_dir': str(INDEX_DIR)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/query')
async def query(req: QueryRequest):
    global _agent
    if _agent is None:
        try:
            _agent = QAAgent()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f'Не удалось загрузить агент: {e}')

    try:
        res = _agent.ask(req.query)
        return {
            'query': req.query,
            'answer': res['answer'],
            'sources': res['sources']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/add_files')
async def add_files(files: list[UploadFile] = File(...)):
    """
    Загрузка нескольких файлов в каталог данных
    """
    uploaded_files = []
    skipped_files = []
    
    try:
        data_dir = Path(DATA_DIR)
        data_dir.mkdir(parents=True, exist_ok=True)
        
        for file in files:
            file_extension = Path(file.filename).suffix.lower()
            
            if file_extension not in ALLOWED_EXTENSIONS:
                skipped_files.append({
                    'filename': file.filename,
                    'reason': f'Неподдерживаемый формат: {file_extension}'
                })
                continue
            
            file_path = data_dir / file.filename
            
            counter = 1
            original_file_path = file_path
            while file_path.exists():
                name = original_file_path.stem
                suffix = original_file_path.suffix
                file_path = data_dir / f"{name}_{counter}{suffix}"
                counter += 1
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append({
                'original_name': file.filename,
                'saved_name': file_path.name,
                'path': str(file_path)
            })
        
        try:
            build_faiss_index(data_folder=data_dir, index_dir=INDEX_DIR)
            
            global _agent
            if _agent is not None:
                _agent.load_actual_index()
                
        except Exception as e:
            return {
                "status": "warning",
                "message": f"Файлы загружены, но ошибка при обновлении индекса: {str(e)}",
                "uploaded_files": uploaded_files,
                "skipped_files": skipped_files
            }
        
        return {
            "status": "success",
            "message": f"Успешно загружено {len(uploaded_files)} файлов и обновлен индекс",
            "uploaded_files": uploaded_files,
            "skipped_files": skipped_files,
            "total_uploaded": len(uploaded_files),
            "total_skipped": len(skipped_files)
        }
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Ошибка загрузки файлов: {str(e)}"
        )


@app.get('/health')
async def health():
    return {'status': 'ok'}


if __name__ == '__main__':
    uvicorn.run('server:app', reload=True)