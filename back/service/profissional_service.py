from db.repository import profissional_repository


def listar_residentes():
    return profissional_repository.listar_residentes()


def listar_preceptores():
    return profissional_repository.listar_preceptores()
