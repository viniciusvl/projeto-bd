from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProcedimentoInput(BaseModel):
    id_procedimento: int
    quantidade: int = 1
    tempo_real: Optional[int] = None
    observacao: Optional[str] = None

class AtendimentoCreate(BaseModel):
    data_hora: datetime
    duracao_minutos: int
    id_paciente: int
    id_residente: int
    id_preceptor: int
    id_unidade: Optional[int] = None
    procedimentos: list[ProcedimentoInput] = []


class AtendimentoOut(BaseModel):
    id_atendimento: int
    data_hora: datetime
    duracao_minutos: int
    id_paciente: int
    id_residente: int
    id_preceptor: int
    id_unidade: Optional[int] = None
    nome_residente: Optional[str] = None
    nome_preceptor: Optional[str] = None


class TempoMedioOut(BaseModel):
    id_residente: int
    nome_residente: str
    tempo_medio_minutos: Optional[float] = None


class TempoMedioEsperaOut(BaseModel):
    id_unidade: Optional[int] = None
    unidade: str
    total_atendimentos_analisados: int
    tempo_medio_espera_minutos: Optional[float] = None

class UltimoAtendimentoOut(BaseModel):
    paciente: str
    data_hora: datetime
    residente: str
    preceptor: str
    procedimentos: list[str]