from fastapi import APIRouter, status

from schemas.escala import ReajustarEscalaIn, ReajustarEscalaOut
from service import escala_service

router = APIRouter(prefix="/escala", tags=["escala"])


@router.put("/reajustar", response_model=ReajustarEscalaOut, status_code=status.HTTP_200_OK)
def reajustar_escala(data: ReajustarEscalaIn):
    """Reajusta dia/turno das escalas de um residente (via sp_reajustar_escala).
    Retorna 400 se houver conflito de escala."""
    return escala_service.reajustar_escala(data)
