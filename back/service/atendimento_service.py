from db.repository import atendimento_repository
from exceptions.errors import BadRequest
from schemas.atendimento import AtendimentoCreate


def criar_atendimento(atendimento: AtendimentoCreate):
    novo_id = atendimento_repository.criar_atendimento(
        atendimento.data_hora,
        atendimento.duracao_minutos,
        atendimento.id_paciente,
        atendimento.id_residente,
        atendimento.id_preceptor,
    )
    if novo_id is None:
        raise BadRequest("Paciente, residente ou preceptor inexistente.")
    return {"id_atendimento": novo_id, **atendimento.model_dump()}


def listar_por_paciente(id_paciente: int):
    return atendimento_repository.listar_por_paciente(id_paciente)


def tempo_medio():
    return atendimento_repository.tempo_medio()
