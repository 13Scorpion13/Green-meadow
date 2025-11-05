from pydantic import BaseModel

class ContentTypeBase(BaseModel):
    name: str

class ContentTypeRead(ContentTypeBase):
    id: int