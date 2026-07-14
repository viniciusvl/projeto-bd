from fastapi import APIRouter

from schemas.paciente import PacienteOut, PacienteUpdate
from service import paciente_service

router = APIRouter(prefix="/paciente", tags=["paciente"])


@router.get("/", response_model=list[PacienteOut])
def listar_pacientes():
    return paciente_service.listar_todos()


@router.patch("")
def atualizar_paciente(paciente: PacienteUpdate):
    return paciente_service.atualizar(paciente)
