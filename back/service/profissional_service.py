from db.connect import get_session
from db.repository import profissional_repository


def listar_residentes():
    with get_session() as session:
        return profissional_repository.listar_residentes(session)


def listar_preceptores():
    with get_session() as session:
        return profissional_repository.listar_preceptores(session)