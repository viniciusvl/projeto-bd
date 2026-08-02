from db.connect import get_session
from db.repository import procedimento_repository
from exceptions.errors import NotFound
from exceptions.repository_exceptions import EntidadeNaoEncontradaError, ProcedimentoJaFaturadoError


def listar_por_atendimento(id_atendimento: int):
    with get_session() as session:
        return procedimento_repository.listar_por_atendimento(session, id_atendimento)


def remover(id_atendimento: int, id_procedimento: int):
    with get_session() as session:
        try:
            procedimento_repository.remover(session, id_atendimento, id_procedimento)
        except (EntidadeNaoEncontradaError, ProcedimentoJaFaturadoError) as exc:
            # Mesmo contrato de antes (NotFound pros dois casos); a mensagem
            # agora distingue "não encontrado" de "já faturado".
            raise NotFound(str(exc))