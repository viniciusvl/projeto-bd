from fastapi import APIRouter, status

from schemas.atendimento import AtendimentoCreate, AtendimentoOut, TempoMedioOut, TempoMedioEsperaOut, UltimoAtendimentoOut
from service import atendimento_service

router = APIRouter(prefix="/atendimento", tags=["atendimento"])


@router.get("/tempo-medio/", response_model=list[TempoMedioOut])
def tempo_medio():
    return atendimento_service.tempo_medio()


@router.get("/tempo-medio-espera/", response_model=list[TempoMedioEsperaOut])
def tempo_medio_espera():
    """Tempo médio de espera por unidade (via sp_calcular_tempo_medio_espera)."""
    return atendimento_service.tempo_medio_espera()


@router.post("", response_model=AtendimentoOut, status_code=status.HTTP_201_CREATED)
def criar_atendimento(atendimento: AtendimentoCreate):
    """Registra atendimento e procedimentos atomicamente (via sp_registrar_atendimento_completo)."""
    return atendimento_service.criar_atendimento(atendimento)


@router.get("/", response_model=list[AtendimentoOut])
def listar_por_paciente(id_paciente: int):
    return atendimento_service.listar_por_paciente(id_paciente)

def ultimo_atendimento_por_paciente():
    """Último atendimento de cada paciente, com residente, preceptor e procedimentos realizados."""
    return atendimento_service.ultimo_atendimento_por_paciente()
 
