from pydantic import BaseModel


class RankingResidenteOut(BaseModel):
    nome: str
    total: int


class PreceptorSupervisaoOut(BaseModel):
    nome_preceptor: str
    total_supervisoes: int


class PlantaoUnidadeOut(BaseModel):
    unidade: str
    residente: str
    quantidade_plantoes: int


class PacienteSemRiscoOut(BaseModel):
    paciente: str
