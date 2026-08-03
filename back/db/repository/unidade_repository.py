"""Repository de Unidade (SQLAlchemy ORM)."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models import Unidade


def listar_todas(session: Session):
    stmt = select(
        Unidade.id_unidade,
        Unidade.nome,
        Unidade.tipo,
        Unidade.capacidade_leitos,
    ).order_by(Unidade.nome)
    return session.execute(stmt).all()
