from datetime import datetime
from typing import Optional
 
from sqlalchemy import exists, func, literal_column, select
from sqlalchemy.orm import Session, joinedload, selectinload

from exceptions.repository_exceptions import EntidadeRelacionadaInexistenteError
from db.models import (
    Atendimento,
    Paciente,
    Preceptor,
    ProcedimentoRealizado,
    Residente,
)

def criar_atendimento(
    session: Session,
    data_hora: datetime,
    duracao_minutos: int,
    id_paciente: int,
    id_residente: int,
    id_preceptor: int,
    id_unidade: Optional[int] = None,
    procedimentos: Optional[list[dict]] = None,
) -> int:

    paciente_existe = session.scalar(select(exists().where(Paciente.id_pessoa == id_paciente)))
    if not paciente_existe:
        raise EntidadeRelacionadaInexistenteError(f"Paciente {id_paciente} não encontrado.")

    residente_existe = session.scalar(
        select(exists().where(Residente.id_profissional == id_residente))
    )
    if not residente_existe:
        raise EntidadeRelacionadaInexistenteError(f"Residente {id_residente} não encontrado.")

    preceptor_existe = session.scalar(
        select(exists().where(Preceptor.id_profissional == id_preceptor))
    )
    if not preceptor_existe:
        raise EntidadeRelacionadaInexistenteError(f"Preceptor {id_preceptor} não encontrado.")

    novo_atendimento = Atendimento(
        data_hora=data_hora,
        duracao_minutos=duracao_minutos,
        id_paciente=id_paciente,
        id_residente=id_residente,
        id_preceptor=id_preceptor,
        id_unidade=id_unidade,
    )
    session.add(novo_atendimento)
    session.flush()  # popula novo_atendimento.id_atendimento sem commitar

    for item in procedimentos or []:
        session.add(
            ProcedimentoRealizado(
                id_atendimento=novo_atendimento.id_atendimento,
                id_procedimento=item["id_procedimento"],
                quantidade=item.get("quantidade", 1),
                tempo_real_minutos=item.get("tempo_real_minutos"),
                data_hora_inicio=item.get("data_hora_inicio"),
                observacao=item.get("observacao"),
            )
        )

    return novo_atendimento.id_atendimento


def listar_por_paciente(session: Session, id_paciente: int):
    """Lista os atendimentos de um paciente, já trazendo nome do residente e do preceptor."""
    stmt = (
        select(
            Atendimento.id_atendimento,
            Atendimento.data_hora,
            Atendimento.duracao_minutos,
            Atendimento.id_paciente,
            Atendimento.id_residente,
            Atendimento.id_preceptor,
            Atendimento.id_unidade,
            Residente.nome.label("nome_residente"),  # nome herdado de Pessoa
            Preceptor.nome.label("nome_preceptor"),  # nome herdado de Pessoa
        )
        .join(Residente, Residente.id_profissional == Atendimento.id_residente)
        .join(Preceptor, Preceptor.id_profissional == Atendimento.id_preceptor)
        .where(Atendimento.id_paciente == id_paciente)
        .order_by(Atendimento.data_hora)
    )
    return session.execute(stmt).all()


def tempo_medio(session: Session):
    stmt = (
        select(
            Residente.id_profissional.label("id_residente"),
            Residente.nome.label("nome_residente"),
            func.round(func.avg(Atendimento.duracao_minutos), 1).label("tempo_medio_minutos"),
        )
        .outerjoin(Atendimento, Atendimento.id_residente == Residente.id_profissional)
        .group_by(Residente.id_profissional, Residente.nome)
        .order_by(func.avg(Atendimento.duracao_minutos).desc())
    )
    return session.execute(stmt).all()


def tempo_medio_espera(session: Session):
    inicio_primeiro_procedimento = (
        select(
            ProcedimentoRealizado.id_atendimento,
            func.min(ProcedimentoRealizado.data_hora_inicio).label("inicio"),
        )
        .where(ProcedimentoRealizado.data_hora_inicio.is_not(None))
        .group_by(ProcedimentoRealizado.id_atendimento)
        .subquery()
    )

    stmt = select(
        func.round(
            func.avg(
                func.timestampdiff(
                    literal_column("MINUTE"),
                    Atendimento.data_hora,
                    inicio_primeiro_procedimento.c.inicio,
                )
            ),
            1,
        ).label("tempo_medio_espera_minutos")
    ).join(
        inicio_primeiro_procedimento,
        inicio_primeiro_procedimento.c.id_atendimento == Atendimento.id_atendimento,
    )
    return session.execute(stmt).scalar()

# Consulta nova da etapa 2
def ultimo_atendimento_por_paciente(session: Session):
    ranked = (
        select(
            Atendimento.id_atendimento,
            func.row_number()
            .over(
                partition_by=Atendimento.id_paciente,
                order_by=Atendimento.data_hora.desc(),
            )
            .label("rn"),
        )
    ).subquery()
 
    stmt = (
        select(Atendimento)
        .join(ranked, ranked.c.id_atendimento == Atendimento.id_atendimento)
        .where(ranked.c.rn == 1)
        .options(
            joinedload(Atendimento.paciente),
            joinedload(Atendimento.residente),
            joinedload(Atendimento.preceptor),
            selectinload(Atendimento.procedimentos_realizados).joinedload(
                ProcedimentoRealizado.procedimento
            ),
        )
        .order_by(Atendimento.data_hora.desc())
    )
 
    atendimentos = session.scalars(stmt).unique().all()
 
    resultado = []
    for atend in atendimentos:
        resultado.append(
            {
                "paciente": atend.paciente.nome,
                "data_hora": atend.data_hora,
                "residente": atend.residente.nome,
                "preceptor": atend.preceptor.nome,
                "procedimentos": [
                    pr.procedimento.nome for pr in atend.procedimentos_realizados
                ],
            }
        )
    return resultado
