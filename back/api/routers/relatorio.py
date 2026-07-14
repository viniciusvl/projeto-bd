from datetime import datetime
from typing import Optional

from fastapi import APIRouter

from schemas.relatorio import (
    PacienteSemRiscoOut,
    PlantaoUnidadeOut,
    PreceptorSupervisaoOut,
    RankingResidenteOut,
)
from service import relatorio_service

router = APIRouter(prefix="/relatorio", tags=["relatorio"])


@router.get("/ranking-residentes/", response_model=list[RankingResidenteOut])
def ranking_residentes():
    return relatorio_service.ranking_residentes()


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
