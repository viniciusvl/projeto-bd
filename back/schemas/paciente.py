from datetime import date
from typing import Optional

from pydantic import BaseModel


class PacienteCreate(BaseModel):
    nome: str
    cpf: str
    data_nascimento: date
    is_flamengo: bool = False
    telefone: Optional[str] = None
    num_convenio: Optional[str] = None
    grupo_sanguineo: Optional[str] = None
    estado: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None


class PacienteUpdate(BaseModel):
    id_pessoa: int
    num_convenio: Optional[str] = None
    estado: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None


class PacienteOut(BaseModel):
    id_pessoa: int
    nome: str
    telefone: Optional[str] = None
    num_convenio: Optional[str] = None
    grupo_sanguineo: Optional[str] = None
    estado: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
