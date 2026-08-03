from db.connect import get_session
from db.repository import atendimento_repository
from exceptions.errors import BadRequest
from exceptions.repository_exceptions import EntidadeRelacionadaInexistenteError
from schemas.atendimento import AtendimentoCreate


def criar_atendimento(atendimento: AtendimentoCreate):
    procedimentos = [p.model_dump() for p in atendimento.procedimentos]
    with get_session() as session:
        try:
            novo_id = atendimento_repository.criar_atendimento(
                session,
                atendimento.data_hora,
                atendimento.duracao_minutos,
                atendimento.id_paciente,
                atendimento.id_residente,
                atendimento.id_preceptor,
                atendimento.id_unidade,
                procedimentos,
            )
        except EntidadeRelacionadaInexistenteError as exc:
            raise BadRequest(str(exc))
    return {"id_atendimento": novo_id, **atendimento.model_dump(exclude={"procedimentos"})}


def listar_por_paciente(id_paciente: int):
    with get_session() as session:
        return atendimento_repository.listar_por_paciente(session, id_paciente)


def tempo_medio():
    with get_session() as session:
        return atendimento_repository.tempo_medio(session)


def tempo_medio_espera():
    with get_session() as session:
        return atendimento_repository.tempo_medio_espera(session)

def ultimo_atendimento_por_paciente():
    with get_session() as session:
        return atendimento_repository.ultimo_atendimento_por_paciente(session)
