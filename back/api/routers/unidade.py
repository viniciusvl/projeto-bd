from fastapi import APIRouter

from schemas.unidade import UnidadeOut
from service import unidade_service

router = APIRouter(prefix="/unidade", tags=["unidade"])


@router.get("/", response_model=list[UnidadeOut])
def listar_unidades():
    """Lista todas as unidades (usada, p.ex., no formulário de nova escala)."""
    return unidade_service.listar()
