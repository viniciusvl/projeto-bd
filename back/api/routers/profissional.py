from fastapi import APIRouter

from schemas.profissional import ProfissionalOut
from service import profissional_service

router = APIRouter(prefix="/profissional", tags=["profissional"])


@router.get("/residentes/", response_model=list[ProfissionalOut])
def listar_residentes():
    return profissional_service.listar_residentes()


@router.get("/preceptores/", response_model=list[ProfissionalOut])
def listar_preceptores():
    return profissional_service.listar_preceptores()
