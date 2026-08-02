"""Repository de Escala (SQLAlchemy ORM)."""

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from exceptions.repository_exceptions import ConflitoDeEscalaError, EntidadeNaoEncontradaError
from db.models import Escala


def reajustar_escala(
    session: Session,
    id_residente: int,
    dia_origem: str,
    turno_origem: str,
    dia_destino: str,
    turno_destino: str,
) -> Escala:
    """
    Substitui `sp_reajustar_escala`.

    PREMISSA (procedure original não disponível): "conflito" = o residente
    já possuir uma escala cadastrada no dia/turno de destino. Ajuste o
    filtro do `conflito` abaixo se a regra real for outra.

    NÃO incrementamos `versao` manualmente: `models.Escala` já usa
    `__mapper_args__ = {"version_id_col": versao}`, então o próprio
    SQLAlchemy incrementa a coluna a cada UPDATE e levanta
    `StaleDataError` automaticamente se a linha foi alterada por outra
    transação entre a leitura e o flush — nós só traduzimos isso para a
    exceção de domínio `ConflitoDeEscalaError`.
    """
    escala_atual = session.scalar(
        select(Escala).where(
            Escala.id_residente == id_residente,
            Escala.dia_semana == dia_origem,
            Escala.turno == turno_origem,
        )
    )
    if escala_atual is None:
        raise EntidadeNaoEncontradaError(
            f"Nenhuma escala encontrada para o residente {id_residente} em "
            f"{dia_origem}/{turno_origem}."
        )

    conflito = session.scalar(
        select(Escala).where(
            Escala.id_residente == id_residente,
            Escala.dia_semana == dia_destino,
            Escala.turno == turno_destino,
            Escala.id_escala != escala_atual.id_escala,
        )
    )
    if conflito is not None:
        raise ConflitoDeEscalaError(
            f"Residente {id_residente} já possui escala em {dia_destino}/{turno_destino}."
        )

    escala_atual.dia_semana = dia_destino
    escala_atual.turno = turno_destino

    try:
        session.flush()
    except StaleDataError as exc:
        raise ConflitoDeEscalaError(
            "A escala foi alterada por outra operação concorrente; tente novamente."
        ) from exc

    return escala_atual