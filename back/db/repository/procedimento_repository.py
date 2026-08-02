"""Repository de ProcedimentoRealizado (SQLAlchemy ORM)."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from exceptions.repository_exceptions import EntidadeNaoEncontradaError, ProcedimentoJaFaturadoError
from db.models import (
    Procedimento,
    ProcedimentoRealizado,
)


def listar_por_atendimento(session: Session, id_atendimento: int):
    stmt = (
        select(
            ProcedimentoRealizado.id_procedimento,
            Procedimento.nome.label("nome_procedimento"),
            ProcedimentoRealizado.quantidade,
            ProcedimentoRealizado.tempo_real_minutos.label("tempo_real"),
            ProcedimentoRealizado.faturado,
        )
        .join(Procedimento, Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento)
        .where(ProcedimentoRealizado.id_atendimento == id_atendimento)
    )
    return session.execute(stmt).all()


def remover(session: Session, id_atendimento: int, id_procedimento: int) -> None:
    """Remove um procedimento_realizado, somente se ainda não tiver sido faturado."""
    registro = session.get(
        ProcedimentoRealizado,
        {"id_atendimento": id_atendimento, "id_procedimento": id_procedimento},
    )
    if registro is None:
        raise EntidadeNaoEncontradaError("Procedimento realizado não encontrado.")
    if registro.faturado:
        raise ProcedimentoJaFaturadoError(
            "Não é possível remover: o procedimento já foi faturado."
        )

    session.delete(registro)