from db.connect import get_session
from db.repository import relatorio_repository


def ranking_residentes():
    with get_session() as session:
        return relatorio_repository.ranking_residentes(session)


def ranking_preceptores():
    with get_session() as session:
        return relatorio_repository.ranking_preceptores(session)


def preceptores_supervisao(ano, mes):
    with get_session() as session:
        return relatorio_repository.preceptores_supervisao(session, ano, mes)


def plantoes_por_unidade():
    with get_session() as session:
        return relatorio_repository.plantoes_por_unidade(session)


def pacientes_sem_risco_alto():
    with get_session() as session:
        return relatorio_repository.pacientes_sem_risco_alto(session)


# --- Views ---

def pacientes_internados():
    with get_session() as session:
        return relatorio_repository.pacientes_internados(session)


def residentes_sem_supervisor():
    with get_session() as session:
        return relatorio_repository.residentes_sem_supervisor(session)


def estatisticas_mensais(ano=None, mes=None):
    with get_session() as session:
        return relatorio_repository.estatisticas_mensais(session, ano, mes)


def tempo_medio_procedimentos():
    with get_session() as session:
        return relatorio_repository.tempo_medio_procedimentos(session)


def auditoria_atendimentos(data_inicial=None, data_final=None, cursor=None, limite: int = 20):
    with get_session() as session:
        return relatorio_repository.auditoria_atendimentos(
            session, data_inicial, data_final, cursor, limite
        )