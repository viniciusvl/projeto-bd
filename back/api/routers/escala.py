from fastapi import APIRouter, status

from schemas.escala import EscalaCreate, EscalaOut, ReajustarEscalaIn, ReajustarEscalaOut
from service import escala_service

router = APIRouter(prefix="/escala", tags=["escala"])


@router.get("/", response_model=list[EscalaOut])
def listar_escalas():
    """Lista todas as escalas do sistema (com nomes de unidade/residente/preceptor)."""
    return escala_service.listar()


@router.post("", response_model=EscalaOut, status_code=status.HTTP_201_CREATED)
def criar_escala(data: EscalaCreate):
    """Cadastra uma nova escala.
    Retorna 400 se o residente já estiver escalado em outra unidade no mesmo
    dia/turno (trigger de sobreposição) ou se a escala já existir (UNIQUE)."""
    return escala_service.criar(data)


@router.put("/reajustar", response_model=ReajustarEscalaOut, status_code=status.HTTP_200_OK)
def reajustar_escala(data: ReajustarEscalaIn):
    """Reajusta dia/turno das escalas de um residente (via sp_reajustar_escala).
    Retorna 400 se houver conflito de escala."""
    return escala_service.reajustar_escala(data)
