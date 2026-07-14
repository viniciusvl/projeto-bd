from db.repository import paciente_repository
from exceptions.errors import NotFound
from schemas.paciente import PacienteUpdate


def listar_todos():
    return paciente_repository.listar_todos()


def atualizar(paciente: PacienteUpdate):
    linhas = paciente_repository.atualizar(
        paciente.id_pessoa,
        paciente.num_convenio,
        paciente.estado,
        paciente.cidade,
        paciente.bairro,
        paciente.logradouro,
        paciente.numero,
    )
    if linhas == 0:
        raise NotFound("Paciente não encontrado.")
    return {"id_pessoa": paciente.id_pessoa, "atualizado": True}
