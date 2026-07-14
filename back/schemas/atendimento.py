from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AtendimentoCreate(BaseModel):
    data_hora: datetime
    duracao_minutos: int
    id_paciente: int
    id_residente: int
    id_preceptor: int


class AtendimentoOut(BaseModel):
    id_atendimento: int
    data_hora: datetime
    duracao_minutos: int
    id_paciente: int
    id_residente: int
    id_preceptor: int


class TempoMedioOut(BaseModel):
    id_residente: int
    nome_residente: str
    tempo_medio_minutos: Optional[float] = None
