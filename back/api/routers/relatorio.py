from datetime import datetime
from typing import Optional

from fastapi import APIRouter

from schemas.relatorio import (
    EstatisticaMensalOut,
    PacienteInternadoOut,
    PacienteSemRiscoOut,
    PlantaoUnidadeOut,
    PreceptorSupervisaoOut,
    RankingPreceptorOut,
    RankingResidenteOut,
    ResidenteSemSupervisorOut,
)
from service import relatorio_service

router = APIRouter(prefix="/relatorio", tags=["relatorio"])


@router.get("/ranking-residentes/", response_model=list[RankingResidenteOut])
def ranking_residentes():
    return relatorio_service.ranking_residentes()


@router.get("/ranking-preceptores/", response_model=list[RankingPreceptorOut])
def ranking_preceptores():
    return relatorio_service.ranking_preceptores()


@router.get("/preceptores-supervisao/", response_model=list[PreceptorSupervisaoOut])
def preceptores_supervisao(ano: Optional[int] = None, mes: Optional[int] = None):
    hoje = datetime.now()
    return relatorio_service.preceptores_supervisao(ano or hoje.year, mes or hoje.month)


@router.get("/plantoes-por-unidade/", response_model=list[PlantaoUnidadeOut])
def plantoes_por_unidade():
    return relatorio_service.plantoes_por_unidade()


@router.get("/pacientes-sem-risco-alto/", response_model=list[PacienteSemRiscoOut])
def pacientes_sem_risco_alto():
    return relatorio_service.pacientes_sem_risco_alto()


# --- Views ---

@router.get("/pacientes-internados/", response_model=list[PacienteInternadoOut])
def pacientes_internados():
    """Lista pacientes atualmente internados (via vw_pacientes_internados)."""
    return relatorio_service.pacientes_internados()


@router.get("/residentes-sem-supervisor/", response_model=list[ResidenteSemSupervisorOut])
def residentes_sem_supervisor():
    """Residentes escalados sem supervisor adequado (via vw_residentes_sem_supervisor)."""
    return relatorio_service.residentes_sem_supervisor()


@router.get("/estatisticas-mensais/", response_model=list[EstatisticaMensalOut])
def estatisticas_mensais(ano: Optional[int] = None, mes: Optional[int] = None):
    """Estatísticas mensais de atendimentos por unidade (via vw_estatisticas_atendimentos_mensal)."""
    return relatorio_service.estatisticas_mensais(ano, mes)

