"""Repository de relatórios/estatísticas, migrado de mysql.connector/executar_query para SQLAlchemy ORM."""

from typing import Optional
 
from sqlalchemy import case, exists, extract, func, select
from sqlalchemy.orm import Session
 
from db.views import get_view
from db.models import (
    Atendimento,
    Escala,
    Paciente,
    Preceptor,
    Procedimento,
    ProcedimentoRealizado,
    Residente,
    Unidade,
)

def ranking_residentes(session: Session):
    stmt = (
        select(Residente.nome, func.count(Atendimento.id_atendimento).label("total"))
        .join(Residente, Atendimento.id_residente == Residente.id_profissional)
        .group_by(Residente.id_profissional, Residente.nome)
        .order_by(func.count(Atendimento.id_atendimento).desc())
    )
    return session.execute(stmt).all()


def ranking_preceptores(session: Session):
    stmt = (
        select(Preceptor.nome, func.count(Atendimento.id_atendimento).label("total"))
        .join(Preceptor, Atendimento.id_preceptor == Preceptor.id_profissional)
        .group_by(Preceptor.id_profissional, Preceptor.nome)
        .order_by(func.count(Atendimento.id_atendimento).desc())
    )
    return session.execute(stmt).all()


def preceptores_supervisao(session: Session, ano: int, mes: int):
    stmt = (
        select(
            Preceptor.nome.label("nome_preceptor"),
            func.count(Atendimento.id_atendimento).label("total_supervisoes"),
        )
        .join(Preceptor, Atendimento.id_preceptor == Preceptor.id_profissional)
        .where(
            extract("year", Atendimento.data_hora) == ano,
            extract("month", Atendimento.data_hora) == mes,
        )
        .group_by(Preceptor.id_profissional, Preceptor.nome)
        .having(func.count(Atendimento.id_atendimento) > 5)
        .order_by(func.count(Atendimento.id_atendimento).desc())
    )
    return session.execute(stmt).all()


def plantoes_por_unidade(session: Session):
    stmt = (
        select(
            Unidade.nome.label("unidade"),
            Residente.nome.label("residente"),
            func.count().label("quantidade_plantoes"),
        )
        .select_from(Escala)
        .join(Unidade, Unidade.id_unidade == Escala.id_unidade)
        .join(Residente, Residente.id_profissional == Escala.id_residente)
        .group_by(Unidade.nome, Residente.nome)
        .order_by(Unidade.nome, func.count().desc())
    )
    return session.execute(stmt).all()


def pacientes_sem_risco_alto(session: Session):
    subquery = (
        select(1)
        .select_from(Atendimento)
        .join(ProcedimentoRealizado, ProcedimentoRealizado.id_atendimento == Atendimento.id_atendimento)
        .join(Procedimento, Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento)
        .where(
            Atendimento.id_paciente == Paciente.id_pessoa,
            func.lower(Procedimento.risco) == "alto",
        )
        .correlate(Paciente)
    )
    stmt = (
        select(Paciente.nome.label("paciente"))
        .where(~exists(subquery))
        .order_by(Paciente.nome)
    )
    return session.execute(stmt).all()

# Consulta nova da Etapa 2
def preceptores_de_residentes_que_atenderam_flamenguistas(session: Session):
    """
    Preceptores que supervisionaram residentes que atenderam pacientes
    flamenguistas (is_flamengo = true).
 
    Como cada linha de `atendimento` já amarra residente + preceptor +
    paciente na mesma consulta, basta filtrar os atendimentos cujo
    paciente é flamenguista e pegar os preceptores distintos envolvidos.
    """
    stmt = (
        select(Preceptor.nome.label("nome_preceptor"))  # nome herdado de Pessoa
        .distinct()
        .select_from(Atendimento)
        .join(Preceptor, Atendimento.id_preceptor == Preceptor.id_profissional)
        .join(Paciente, Paciente.id_pessoa == Atendimento.id_paciente)
        .where(Paciente.is_flamengo.is_(True))
        .order_by(Preceptor.nome)
    )
    return session.execute(stmt).all()
 
# Consulta nova da Etapa 2
def percentual_alto_risco_por_residente(session: Session):
    total_expr = func.coalesce(func.sum(ProcedimentoRealizado.quantidade), 0)
    alto_risco_expr = func.coalesce(
        func.sum(
            case(
                (func.lower(Procedimento.risco) == "alto", ProcedimentoRealizado.quantidade),
                else_=0,
            )
        ),
        0,
    )
    percentual_expr = case(
        (total_expr == 0, 0.0),
        else_=(alto_risco_expr * 100.0 / total_expr),
    )
 
    stmt = (
        select(
            Residente.nome.label("residente"),  # nome herdado de Pessoa
            total_expr.label("total_procedimentos"),
            alto_risco_expr.label("procedimentos_alto_risco"),
            percentual_expr.label("percentual_alto_risco"),
        )
        .outerjoin(Atendimento, Atendimento.id_residente == Residente.id_profissional)
        .outerjoin(
            ProcedimentoRealizado,
            ProcedimentoRealizado.id_atendimento == Atendimento.id_atendimento,
        )
        .outerjoin(
            Procedimento,
            Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento,
        )
        .group_by(Residente.id_profissional, Residente.nome)
        .order_by(percentual_expr.desc())
    )
    return session.execute(stmt).all()
 

# Estas 3 últimas queries consultam views do banco

def pacientes_internados(session: Session):
    tabela = get_view(session.get_bind(), "vw_pacientes_internados")
    stmt = select(tabela)
    return session.execute(stmt).all()


def residentes_sem_supervisor(session: Session):
    tabela = get_view(session.get_bind(), "vw_residentes_sem_supervisor")
    stmt = select(tabela)
    return session.execute(stmt).all()


def estatisticas_mensais(session: Session, ano: Optional[int] = None, mes: Optional[int] = None):
    tabela = get_view(session.get_bind(), "vw_estatisticas_atendimentos_mensal")
    stmt = select(tabela)
    if ano is not None:
        stmt = stmt.where(tabela.c.ano == ano)
    if mes is not None:
        stmt = stmt.where(tabela.c.mes == mes)
    stmt = stmt.order_by(tabela.c.ano.desc(), tabela.c.mes.desc())
    return session.execute(stmt).all()

