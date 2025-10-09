from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from pathlib import Path
import uvicorn
import shutil
from starlette.responses import FileResponse, StreamingResponse
from typing import List
import io
import zipfile

from indexer import build_faiss_index
from qa_agent import QAAgent
from config import INDEX_DIR, DATA_DIR, ALLOWED_EXTENSIONS

app = FastAPI(title='ИИ-архивариус API')

_agent = None

class IndexRequest(BaseModel):
    data_folder: str

class QueryRequest(BaseModel):
    query: str

class DownloadAllRequest(BaseModel):
    source_paths: List[str]

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


@app.get("/download/{filename}")
async def download_file(filename: str):
    """
    Позволяет скачать файл из папки с данными.
    """
    try:
        file_path = Path(DATA_DIR) / filename

        if not file_path.is_file() or not file_path.resolve().is_relative_to(Path(DATA_DIR).resolve()):
            raise HTTPException(status_code=404, detail="Файл не найден или доступ запрещен")

        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/download_all")
async def download_all_files(req: DownloadAllRequest):
    """
    Создает zip-архив из списка файлов и отдает его для скачивания.
    """
    validated_paths = []
    for path_str in req.source_paths:
        file_path = Path(path_str)
        if file_path.is_file() and file_path.resolve().is_relative_to(Path(DATA_DIR).resolve()):
            validated_paths.append(file_path)
        else:
            print(f"Нет файфлов: {path_str}")

    if not validated_paths:
        raise HTTPException(status_code=400, detail="Не найдено валидных файлов для архивации.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in validated_paths:
            zip_file.write(file_path, arcname=file_path.name)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=sources.zip"}
    )


@app.get('/health')
async def health():
    return {'status': 'ok'}


if __name__ == '__main__':
    uvicorn.run('server:app', reload=True)