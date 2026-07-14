from fastapi import APIRouter, Response, status

from schemas.procedimento import ProcedimentoRealizadoOut
from service import procedimento_service

router = APIRouter(prefix="/procedimento", tags=["procedimento"])


@router.get("/", response_model=list[ProcedimentoRealizadoOut])
def listar_por_atendimento(id_atendimento: int):
    return procedimento_service.listar_por_atendimento(id_atendimento)


@router.delete("/{id_procedimento}", status_code=status.HTTP_204_NO_CONTENT)
def remover_procedimento(id_procedimento: int, id_atendimento: int):
    procedimento_service.remover(id_atendimento, id_procedimento)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
