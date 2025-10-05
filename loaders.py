from pathlib import Path
from typing import List
from langchain.schema import Document

from langchain.document_loaders import PyPDFLoader, TextLoader, UnstructuredWordDocumentLoader


def load_documents_from_folder(folder: str | Path) -> List[Document]:
    """
    Рекурсивно обходит папку и загружает PDF/DOCX/TXT в список Document.
    Возвращает список langchain.schema.Document с метаданными (source, page и т.д.).
    """
    folder = Path(folder)
    docs = []
    for f in folder.rglob('*'):
        if f.suffix.lower() == '.pdf':
            try:
                loader = PyPDFLoader(str(f))
                docs.extend(loader.load())
            except Exception as e:
                print(f'Ошибка при загрузке PDF {f}: {e}')
        elif f.suffix.lower() in ('.docx', '.doc'):
            try:
                loader = UnstructuredWordDocumentLoader(str(f))
                docs.extend(loader.load())
            except Exception as e:
                print(f'Ошибка при загрузке DOCX {f}: {e}')
        elif f.suffix.lower() in ('.txt', '.md'):
            try:
                loader = TextLoader(str(f), encoding='utf-8')
                docs.extend(loader.load())
            except Exception as e:
                print(f'Ошибка при загрузке TXT {f}: {e}')
        else:
            continue
    return docs