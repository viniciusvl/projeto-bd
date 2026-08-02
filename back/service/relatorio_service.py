from db.repository import relatorio_repository


def ranking_residentes():
    return relatorio_repository.ranking_residentes()


def ranking_preceptores():
    return relatorio_repository.ranking_preceptores()


def preceptores_supervisao(ano, mes):
    return relatorio_repository.preceptores_supervisao(ano, mes)


def plantoes_por_unidade():
    return relatorio_repository.plantoes_por_unidade()


def pacientes_sem_risco_alto():
    return relatorio_repository.pacientes_sem_risco_alto()


# --- Views ---

def pacientes_internados():
    return relatorio_repository.pacientes_internados()


def residentes_sem_supervisor():
    return relatorio_repository.residentes_sem_supervisor()


def estatisticas_mensais(ano=None, mes=None):
    return relatorio_repository.estatisticas_mensais(ano, mes)

