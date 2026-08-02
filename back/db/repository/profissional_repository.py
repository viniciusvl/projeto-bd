"""Repository de Residente/Preceptor, migrado de mysql.connector/executar_query para SQLAlchemy ORM."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models import Preceptor, Residente


def listar_residentes(session: Session):
    stmt = select(
        Residente.id_profissional,
        Residente.nome,  # herdado de Pessoa
    ).order_by(Residente.nome)
    return session.execute(stmt).all()


def listar_preceptores(session: Session):
    stmt = select(
        Preceptor.id_profissional,
        Preceptor.nome,  # herdado de Pessoa
    ).order_by(Preceptor.nome)
    return session.execute(stmt).all()