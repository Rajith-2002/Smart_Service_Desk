from pydantic import BaseModel


class KBSearchRequest(BaseModel):
    query: str


class KBSearchResponse(BaseModel):
    question: str
    answer: str
    sources: list