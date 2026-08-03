from enum import Enum

from pydantic import BaseModel


class DiaSemana(str, Enum):
    domingo = "domingo"
    segunda = "segunda"
    terca = "terca"
    quarta = "quarta"
    quinta = "quinta"
    sexta = "sexta"
    sabado = "sabado"


class Turno(str, Enum):
    manha = "manha"
    tarde = "tarde"
    noite = "noite"


class ReajustarEscalaIn(BaseModel):
    id_residente: int
    dia_origem: DiaSemana
    turno_origem: Turno
    dia_destino: DiaSemana
    turno_destino: Turno


class ReajustarEscalaOut(BaseModel):
    message: str


class EscalaCreate(BaseModel):
    id_unidade: int
    dia_semana: DiaSemana
    turno: Turno
    id_residente: int
    id_preceptor: int


class EscalaOut(BaseModel):
    id_escala: int
    id_unidade: int
    nome_unidade: str
    dia_semana: str
    turno: str
    id_residente: int
    nome_residente: str
    id_preceptor: int
    nome_preceptor: str
