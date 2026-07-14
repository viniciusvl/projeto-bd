from db.repository import procedimento_repository
from exceptions.errors import NotFound


def listar_por_atendimento(id_atendimento: int):
    return procedimento_repository.listar_por_atendimento(id_atendimento)


def remover(id_atendimento: int, id_procedimento: int):
    linhas = procedimento_repository.remover(id_atendimento, id_procedimento)
    if linhas == 0:
        raise NotFound("Procedimento não encontrado ou já faturado.")
