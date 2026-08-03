from pydantic import BaseModel


class UnidadeOut(BaseModel):
    id_unidade: int
    nome: str
    tipo: str
    capacidade_leitos: int
