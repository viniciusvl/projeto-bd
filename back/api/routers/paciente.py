from fastapi import APIRouter, status

from schemas.paciente import PacienteCreate, PacienteOut, PacienteUpdate
from service import paciente_service

router = APIRouter(prefix="/paciente", tags=["paciente"])


@router.get("/", response_model=list[PacienteOut])
def listar_pacientes():
    return paciente_service.listar_todos()


@router.post("", response_model=PacienteOut, status_code=status.HTTP_201_CREATED)
def criar_paciente(paciente: PacienteCreate):
    return paciente_service.criar(paciente)


@router.patch("")
def atualizar_paciente(paciente: PacienteUpdate):
    return paciente_service.atualizar(paciente)
