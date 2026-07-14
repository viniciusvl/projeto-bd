from fastapi import APIRouter, status

from schemas.atendimento import AtendimentoCreate, AtendimentoOut, TempoMedioOut
from service import atendimento_service

router = APIRouter(prefix="/atendimento", tags=["atendimento"])


@router.get("/tempo-medio/", response_model=list[TempoMedioOut])
def tempo_medio():
    return atendimento_service.tempo_medio()


@router.post("", response_model=AtendimentoOut, status_code=status.HTTP_201_CREATED)
def criar_atendimento(atendimento: AtendimentoCreate):
    return atendimento_service.criar_atendimento(atendimento)


@router.get("/", response_model=list[AtendimentoOut])
def listar_por_paciente(id_paciente: int):
    return atendimento_service.listar_por_paciente(id_paciente)
