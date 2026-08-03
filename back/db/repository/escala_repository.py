"""Repository de Escala (SQLAlchemy ORM)."""

from sqlalchemy import select
from sqlalchemy.orm import Session, aliased
from sqlalchemy.orm.exc import StaleDataError

from exceptions.repository_exceptions import ConflitoDeEscalaError, EntidadeNaoEncontradaError
from db.models import Escala, Preceptor, Residente, Unidade


def listar_todas(session: Session):
    """Lista todas as escalas já com os nomes de unidade/residente/preceptor.

    `Residente` e `Preceptor` herdam `nome` de `Pessoa` (herança joined-table),
    então usamos aliases para juntar as duas cadeias de herança sem ambiguidade.
    """
    res = aliased(Residente)
    prec = aliased(Preceptor)
    stmt = (
        select(
            Escala.id_escala,
            Escala.id_unidade,
            Unidade.nome.label("nome_unidade"),
            Escala.dia_semana,
            Escala.turno,
            Escala.id_residente,
            res.nome.label("nome_residente"),
            Escala.id_preceptor,
            prec.nome.label("nome_preceptor"),
        )
        .join(Unidade, Escala.id_unidade == Unidade.id_unidade)
        .join(res, Escala.id_residente == res.id_profissional)
        .join(prec, Escala.id_preceptor == prec.id_profissional)
        .order_by(Unidade.nome, Escala.dia_semana, Escala.turno)
    )
    return session.execute(stmt).all()


def criar(
    session: Session,
    id_unidade: int,
    dia_semana: str,
    turno: str,
    id_residente: int,
    id_preceptor: int,
) -> Escala:
    """
    Insere uma nova escala. O `flush()` dispara o INSERT — e é aqui que:
    - o trigger `trg_check_sobreposicao_escala_insert` (SIGNAL 45000) bloqueia
      um residente escalado em outra unidade no mesmo dia/turno; e
    - a UNIQUE `uq_escala_unidade_turno_residente` bloqueia escala duplicada.
    Ambos sobem como exceção do SQLAlchemy para o service traduzir.
    """
    nova = Escala(
        id_unidade=id_unidade,
        dia_semana=dia_semana,
        turno=turno,
        id_residente=id_residente,
        id_preceptor=id_preceptor,
    )
    session.add(nova)
    session.flush()
    return nova


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