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


class TempoMedioProcedimentoOut(BaseModel):
    id_procedimento: int
    codigo: str
    nome: str
    risco: str
    tempo_medio_minutos: Optional[int] = None
    total_realizacoes: int


class AuditoriaAtendimentoOut(BaseModel):
    id_auditoria: int
    id_atendimento: Optional[int] = None
    operacao: str
    registrado_em: datetime
    data_hora_antigo: Optional[datetime] = None
    data_hora_novo: Optional[datetime] = None
    duracao_minutos_antigo: Optional[int] = None
    duracao_minutos_novo: Optional[int] = None
    paciente_antigo: Optional[str] = None
    paciente_novo: Optional[str] = None
    residente_antigo: Optional[str] = None
    residente_novo: Optional[str] = None
    preceptor_antigo: Optional[str] = None
    preceptor_novo: Optional[str] = None
    unidade_antigo: Optional[str] = None
    unidade_novo: Optional[str] = None


class AuditoriaPageOut(BaseModel):
    items: list[AuditoriaAtendimentoOut]
    next_cursor: Optional[int] = None
    total: int
