from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class RankingResidenteOut(BaseModel):
    nome: str
    total: int


class PreceptorSupervisaoOut(BaseModel):
    nome_preceptor: str
    total_supervisoes: int


class RankingPreceptorOut(BaseModel):
    nome: str
    total: int


class PlantaoUnidadeOut(BaseModel):
    unidade: str
    residente: str
    quantidade_plantoes: int


class PacienteSemRiscoOut(BaseModel):
    paciente: str


# --- Views ---

class PacienteInternadoOut(BaseModel):
    id_paciente: int
    nome_paciente: str
    cpf: str
    num_convenio: Optional[str] = None
    unidade_internacao: str
    data_entrada: datetime
    motivo: Optional[str] = None


class ResidenteSemSupervisorOut(BaseModel):
    id_escala: int
    nome_unidade: str
    dia_semana: str
    turno: str
    nome_residente: str
    ano_residencia: int
    nome_preceptor: str
    titulacao_preceptor: str
    motivo_alerta: str


class EstatisticaMensalOut(BaseModel):
    ano: int
    mes: int
    nome_unidade: str
    total_atendimentos: int
    media_duracao_minutos: Optional[float] = None
    procedimento_mais_comum: str
