from db.connect import get_session
from db.repository import unidade_repository


def listar():
    with get_session() as session:
        return unidade_repository.listar_todas(session)
