from typing import Optional

from pydantic import BaseModel


class ProcedimentoRealizadoOut(BaseModel):
    id_procedimento: int
    nome_procedimento: str
    quantidade: int
    tempo_real: Optional[int] = None
    faturado: bool
