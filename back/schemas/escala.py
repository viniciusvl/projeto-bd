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
