"""Repository de relatórios/estatísticas, migrado de mysql.connector/executar_query para SQLAlchemy ORM."""

from typing import Optional
 
from sqlalchemy import case, exists, extract, func, select
from sqlalchemy.orm import Session
 
from db.views import get_view
from db.models import (
    Atendimento,
    AuditoriaAtendimento,
    Escala,
    Paciente,
    Pessoa,
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
    return [dict(row._mapping) for row in session.execute(stmt).all()]


def residentes_sem_supervisor(session: Session):
    tabela = get_view(session.get_bind(), "vw_residentes_sem_supervisor")
    stmt = select(tabela)
    return [dict(row._mapping) for row in session.execute(stmt).all()]


def estatisticas_mensais(session: Session, ano: Optional[int] = None, mes: Optional[int] = None):
    tabela = get_view(session.get_bind(), "vw_estatisticas_atendimentos_mensal")
    stmt = select(tabela)
    if ano is not None:
        stmt = stmt.where(tabela.c.ano == ano)
    if mes is not None:
        stmt = stmt.where(tabela.c.mes == mes)
    stmt = stmt.order_by(tabela.c.ano.desc(), tabela.c.mes.desc())
    return [dict(row._mapping) for row in session.execute(stmt).all()]


def tempo_medio_procedimentos(session: Session):
    """Tempo médio (minutos) de cada procedimento — coluna
    `procedimento.tempo_medio_minutos`, mantida pelos triggers
    `trg_atualiza_media_procedimentos_*` a partir de `tempo_real_minutos`."""
    stmt = (
        select(
            Procedimento.id_procedimento,
            Procedimento.codigo,
            Procedimento.nome,
            Procedimento.risco,
            Procedimento.tempo_medio_minutos,
            func.count(ProcedimentoRealizado.id_atendimento).label("total_realizacoes"),
        )
        .outerjoin(
            ProcedimentoRealizado,
            Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento,
        )
        .group_by(
            Procedimento.id_procedimento,
            Procedimento.codigo,
            Procedimento.nome,
            Procedimento.risco,
            Procedimento.tempo_medio_minutos,
        )
        .order_by(Procedimento.nome)
    )
    return [dict(row._mapping) for row in session.execute(stmt).all()]


def auditoria_atendimentos(
    session: Session,
    data_inicial=None,
    data_final=None,
    cursor: Optional[int] = None,
    limite: int = 20,
):
    """Histórico de alterações de atendimentos (tabela `auditoria_atendimento`,
    populada pelos triggers `trg_audita_atendimento_*`), com:

    - filtro por intervalo de datas do atendimento (data do evento =
      COALESCE(data_hora_novo, data_hora_antigo));
    - paginação por cursor (id_auditoria, monotônico e decrescente).

    Retorna ``{"items": [...], "next_cursor": <int|None>}``. Quando há mais
    registros além da página atual, ``next_cursor`` traz o id a partir do qual
    a próxima página deve continuar.
    """
    evento = func.coalesce(
        AuditoriaAtendimento.data_hora_novo, AuditoriaAtendimento.data_hora_antigo
    )

    # Total de registros que casam com o filtro de datas (ignora o cursor).
    count_stmt = select(func.count(AuditoriaAtendimento.id_auditoria))
    if data_inicial is not None:
        count_stmt = count_stmt.where(func.date(evento) >= data_inicial)
    if data_final is not None:
        count_stmt = count_stmt.where(func.date(evento) <= data_final)
    total = session.scalar(count_stmt) or 0

    stmt = select(AuditoriaAtendimento)
    if data_inicial is not None:
        stmt = stmt.where(func.date(evento) >= data_inicial)
    if data_final is not None:
        stmt = stmt.where(func.date(evento) <= data_final)
    if cursor is not None:
        stmt = stmt.where(AuditoriaAtendimento.id_auditoria < cursor)

    # Busca um registro a mais que o limite para saber se há próxima página.
    stmt = stmt.order_by(AuditoriaAtendimento.id_auditoria.desc()).limit(limite + 1)
    registros = session.execute(stmt).scalars().all()

    tem_mais = len(registros) > limite
    registros = registros[:limite]
    next_cursor = registros[-1].id_auditoria if tem_mais and registros else None

    pessoas = dict(session.execute(select(Pessoa.id_pessoa, Pessoa.nome)).all())
    unidades = dict(session.execute(select(Unidade.id_unidade, Unidade.nome)).all())

    def nome_pessoa(i):
        return pessoas.get(i) if i is not None else None

    def nome_unidade(i):
        return unidades.get(i) if i is not None else None

    items = [
        {
            "id_auditoria": a.id_auditoria,
            "id_atendimento": a.id_atendimento,
            "operacao": a.operacao,
            "registrado_em": a.registrado_em,
            "data_hora_antigo": a.data_hora_antigo,
            "data_hora_novo": a.data_hora_novo,
            "duracao_minutos_antigo": a.duracao_minutos_antigo,
            "duracao_minutos_novo": a.duracao_minutos_novo,
            "paciente_antigo": nome_pessoa(a.id_paciente_antigo),
            "paciente_novo": nome_pessoa(a.id_paciente_novo),
            "residente_antigo": nome_pessoa(a.id_residente_antigo),
            "residente_novo": nome_pessoa(a.id_residente_novo),
            "preceptor_antigo": nome_pessoa(a.id_preceptor_antigo),
            "preceptor_novo": nome_pessoa(a.id_preceptor_novo),
            "unidade_antigo": nome_unidade(a.id_unidade_antigo),
            "unidade_novo": nome_unidade(a.id_unidade_novo),
        }
        for a in registros
    ]
    return {"items": items, "next_cursor": next_cursor, "total": total}

