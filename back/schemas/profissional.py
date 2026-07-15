from pydantic import BaseModel


class ProfissionalOut(BaseModel):
    id_profissional: int
    nome: str
