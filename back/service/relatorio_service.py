from db.repository import relatorio_repository


def ranking_residentes():
    return relatorio_repository.ranking_residentes()


def preceptores_supervisao(ano, mes):
    return relatorio_repository.preceptores_supervisao(ano, mes)


def plantoes_por_unidade():
    return relatorio_repository.plantoes_por_unidade()


def pacientes_sem_risco_alto():
    return relatorio_repository.pacientes_sem_risco_alto()
