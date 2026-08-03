"""
orm_queries.py
==============

Reescrita das 10 queries originais (crud.sql + analytical_queries.sql) usando
o ORM do SQLAlchemy (estilo 2.0), a partir do mapeamento definido em models.py.

O arquivo está organizado em 4 blocos que correspondem ao que foi pedido:

    1. Mapeamento Objeto-Relacional      -> reaproveita as classes de models.py
                                             (Pessoa/Paciente/Profissional/... já
                                             mapeadas com Mapped[...] / mapped_column)
    2. Sessões / transações via ORM      -> cada função de escrita abre uma
                                             sessão, faz commit em caso de sucesso
                                             e rollback em caso de erro
    3. Consultas com DSL/filter da ORM   -> select(), where(), join(), group_by(),
                                             having(), order_by(), func.*, exists()
    4. Relacionamentos (lazy x eager)    -> seção dedicada no final (demo_lazy_vs_eager)
                                             comparando lazy loading (padrão das
                                             relationships em models.py) com eager
                                             loading via joinedload/selectinload
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import create_engine, select, func, exists, and_, case
from sqlalchemy.orm import Session, sessionmaker, joinedload, selectinload

from models import (
    Base,
    Pessoa,
    Paciente,
    Profissional,
    Preceptor,
    Residente,
    Especialidade,
    Procedimento,
    Unidade,
    Atendimento,
    ProcedimentoRealizado,
    Escala,
    Internacao,
)

# ---------------------------------------------------------------------------
# 1) Mapeamento Objeto-Relacional
# ---------------------------------------------------------------------------
# As classes acima (Paciente, Atendimento, ProcedimentoRealizado, etc.) SÃO o
# mapeamento objeto-relacional: cada classe = uma tabela, cada atributo
# Mapped[...] = uma coluna, e os relationship(...) representam as FKs como
# navegação de objetos (atendimento.paciente, paciente.atendimentos, etc.).
# Aqui só criamos a "Session factory" que usa esse mapeamento para conversar
# com o banco.

# Ajuste a connection string para o seu banco (MySQL, no caso do dump original)
ENGINE_URL = "mysql+pymysql://usuario:senha@localhost:3306/hospital"

engine = create_engine(ENGINE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)

# Base.metadata.create_all(engine)  # descomente se quiser criar as tabelas via ORM


# ---------------------------------------------------------------------------
# 2) Sessões / transações via ORM
# ---------------------------------------------------------------------------
# Todas as funções de escrita seguem o mesmo padrão:
#
#   with SessionLocal() as session:
#       try:
#           ... operações ...
#           session.commit()
#       except Exception:
#           session.rollback()
#           raise
#
# O `with` já garante o fechamento da sessão; o try/except garante que, em
# caso de erro, nada fique "meio salvo" (atomicidade da transação).


# --- Query 1 -----------------------------------------------------------
# Cadastra um novo atendimento, somente se existir o paciente, residente e
# preceptor informados.
def criar_atendimento(
    data_hora: datetime,
    duracao_minutos: int,
    id_paciente: int,
    id_residente: int,
    id_preceptor: int,
    id_unidade: Optional[int] = None,
) -> Optional[Atendimento]:
    with SessionLocal() as session:
        try:
            paciente_existe = session.scalar(
                select(exists().where(Paciente.id_pessoa == id_paciente))
            )
            residente_existe = session.scalar(
                select(exists().where(Residente.id_profissional == id_residente))
            )
            preceptor_existe = session.scalar(
                select(exists().where(Preceptor.id_profissional == id_preceptor))
            )

            if not (paciente_existe and residente_existe and preceptor_existe):
                return None  # equivalente ao WHERE EXISTS ... AND EXISTS ... do SQL puro

            novo_atendimento = Atendimento(
                data_hora=data_hora,
                duracao_minutos=duracao_minutos,
                id_paciente=id_paciente,
                id_residente=id_residente,
                id_preceptor=id_preceptor,
                id_unidade=id_unidade,
            )
            session.add(novo_atendimento)
            session.commit()
            return novo_atendimento
        except Exception:
            session.rollback()
            raise


# --- Query 2 -----------------------------------------------------------
# Lista todos os atendimentos de um determinado paciente, ordenados por data.
def listar_atendimentos_por_paciente(id_paciente: int) -> Sequence[Atendimento]:
    with SessionLocal() as session:
        stmt = (
            select(Atendimento)
            .where(Atendimento.id_paciente == id_paciente)
            .order_by(Atendimento.data_hora)
        )
        return session.scalars(stmt).all()


# --- Query 3 -----------------------------------------------------------
# Lista os procedimentos realizados em um atendimento
# (nome do procedimento, quantidade e tempo real).
def listar_procedimentos_do_atendimento(id_atendimento: int):
    with SessionLocal() as session:
        stmt = (
            select(
                Procedimento.nome.label("nome_procedimento"),
                ProcedimentoRealizado.quantidade,
                ProcedimentoRealizado.tempo_real_minutos.label("tempo_real"),
            )
            .join(
                Procedimento,
                Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento,
            )
            .where(ProcedimentoRealizado.id_atendimento == id_atendimento)
        )
        return session.execute(stmt).all()


# --- Query 4 -----------------------------------------------------------
# Atualiza os dados de um paciente (endereço OU convênio), preservando os
# valores antigos quando o parâmetro não é informado (equivalente ao
# COALESCE(@param, coluna) do SQL puro).
def atualizar_paciente(
    id_pessoa: int,
    convenio: Optional[str] = None,
    estado: Optional[str] = None,
    cidade: Optional[str] = None,
    bairro: Optional[str] = None,
    logradouro: Optional[str] = None,
    numero: Optional[str] = None,
) -> Optional[Paciente]:
    with SessionLocal() as session:
        try:
            paciente = session.get(Paciente, id_pessoa)
            if paciente is None:
                return None

            # COALESCE(@param, coluna_atual) -> só sobrescreve se vier valor novo
            paciente.num_convenio = convenio if convenio is not None else paciente.num_convenio
            paciente.estado = estado if estado is not None else paciente.estado
            paciente.cidade = cidade if cidade is not None else paciente.cidade
            paciente.bairro = bairro if bairro is not None else paciente.bairro
            paciente.logradouro = logradouro if logradouro is not None else paciente.logradouro
            paciente.numero = numero if numero is not None else paciente.numero

            session.commit()
            session.refresh(paciente)
            return paciente
        except Exception:
            session.rollback()
            raise


# --- Query 5 -----------------------------------------------------------
# Remove um procedimento realizado, somente se ainda não tiver sido faturado.
def remover_procedimento_realizado(id_atendimento: int, id_procedimento: int) -> bool:
    with SessionLocal() as session:
        try:
            registro = session.get(
                ProcedimentoRealizado, {"id_atendimento": id_atendimento, "id_procedimento": id_procedimento}
            )
            if registro is None or registro.faturado:
                return False  # não existe, ou já foi faturado -> não pode excluir

            session.delete(registro)
            session.commit()
            return True
        except Exception:
            session.rollback()
            raise


# --- Query 6 -----------------------------------------------------------
# Lista o tempo médio de atendimento por residente.
def tempo_medio_atendimento_por_residente():
    with SessionLocal() as session:
        stmt = (
            select(
                Residente.id_profissional.label("id_residente"),
                Residente.nome.label("nome_residente"),  # nome herdado de Pessoa
                func.round(func.avg(Atendimento.duracao_minutos), 1).label(
                    "tempo_medio_minutos"
                ),
            )
            .outerjoin(Atendimento, Atendimento.id_residente == Residente.id_profissional)
            .group_by(Residente.id_profissional, Residente.nome)
            .order_by(func.avg(Atendimento.duracao_minutos).desc())
        )
        return session.execute(stmt).all()


# --- Query 7 -----------------------------------------------------------
# Ranking dos residentes por número de atendimentos realizados.
def ranking_residentes_por_atendimentos():
    with SessionLocal() as session:
        stmt = (
            select(
                Residente.nome,  # nome herdado de Pessoa
                func.count(Atendimento.id_atendimento).label("total"),
            )
            .join(Residente, Atendimento.id_residente == Residente.id_profissional)
            .group_by(Residente.id_profissional, Residente.nome)
            .order_by(func.count(Atendimento.id_atendimento).desc())
        )
        return session.execute(stmt).all()


# --- Query 8 -----------------------------------------------------------
# Lista os preceptores que supervisionaram mais de 5 atendimentos em um mês.
def preceptores_com_mais_de_n_atendimentos(
    data_inicio: datetime, data_fim: datetime, minimo: int = 5
):
    with SessionLocal() as session:
        stmt = (
            select(
                Preceptor.nome.label("nome_preceptor"),  # nome herdado de Pessoa
                func.count(Atendimento.id_atendimento).label("total_supervisoes"),
            )
            .join(Preceptor, Atendimento.id_preceptor == Preceptor.id_profissional)
            .where(and_(Atendimento.data_hora >= data_inicio, Atendimento.data_hora <= data_fim))
            .group_by(Preceptor.id_profissional, Preceptor.nome)
            .having(func.count(Atendimento.id_atendimento) > minimo)
        )
        return session.execute(stmt).all()


# --- Query 9 -----------------------------------------------------------
# Para cada unidade, quantidade de plantões escalados por residente no mês
# corrente.
def plantoes_por_unidade_e_residente_mes_corrente():
    # OBS: a tabela `escala` guarda um dia da semana recorrente (dia_semana,
    # turno) e não uma data concreta, então não há coluna para filtrar
    # "mês corrente" diretamente nela. A query abaixo reproduz fielmente a
    # consulta original (contagem de plantões por unidade/residente); se o
    # modelo ganhar uma coluna de data/vigência no futuro, basta encadear
    # .where(Escala.data_referencia.between(inicio_mes, fim_mes)).
    with SessionLocal() as session:
        stmt = (
            select(
                Unidade.nome.label("unidade"),
                Residente.nome.label("residente"),  # nome herdado de Pessoa
                func.count().label("quantidade_plantoes"),
            )
            .select_from(Escala)
            .join(Unidade, Unidade.id_unidade == Escala.id_unidade)
            .join(Residente, Residente.id_profissional == Escala.id_residente)
            .group_by(Unidade.nome, Residente.nome)
            .order_by(Unidade.nome, func.count().desc())
        )
        return session.execute(stmt).all()


# --- Query 10 ----------------------------------------------------------
# Lista pacientes que nunca realizaram nenhum procedimento de risco 'ALTO'.
def pacientes_sem_procedimento_alto_risco():
    with SessionLocal() as session:
        subquery = (
            select(1)
            .select_from(Atendimento)
            .join(
                ProcedimentoRealizado,
                ProcedimentoRealizado.id_atendimento == Atendimento.id_atendimento,
            )
            .join(
                Procedimento,
                Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento,
            )
            .where(
                Atendimento.id_paciente == Paciente.id_pessoa,
                func.lower(Procedimento.risco) == "alto",
            )
            .correlate(Paciente)
        )

        stmt = (
            select(Paciente.nome.label("paciente"))  # nome herdado de Pessoa
            .select_from(Paciente)
            .where(~exists(subquery))
        )
        return session.execute(stmt).all()


# ---------------------------------------------------------------------------
# 4) Relacionamentos: lazy loading x eager loading
# ---------------------------------------------------------------------------
# Em models.py, os relationship(...) não definem `lazy=`, então o padrão do
# SQLAlchemy vale: lazy="select" (lazy loading). Ou seja, ao acessar
# `atendimento.paciente`, o SQLAlchemy dispara uma SEGUNDA query só naquele
# momento (é o problema clássico do "N+1 queries").
#
# Para evitar isso, usamos eager loading explícito nas consultas, com
# joinedload (faz um JOIN na mesma query) ou selectinload (faz uma query
# extra em lote, ideal para coleções "many").

def demo_lazy_loading(id_atendimento: int) -> None:
    """Mostra o comportamento padrão (lazy) das relationships de Atendimento."""
    with SessionLocal() as session:
        atendimento = session.get(Atendimento, id_atendimento)  # 1ª query
        print("Atendimento carregado:", atendimento.id_atendimento)

        # Cada linha abaixo dispara UMA query adicional na hora do acesso,
        # porque paciente/residente/preceptor/unidade são lazy="select"
        print("Paciente:", atendimento.paciente.nome)          # 2ª query
        print("Residente:", atendimento.residente.nome)        # 3ª query
        print("Preceptor:", atendimento.preceptor.nome)        # 4ª query
        if atendimento.unidade:
            print("Unidade:", atendimento.unidade.nome)        # 5ª query


def demo_eager_loading(id_atendimento: int) -> None:
    """Mesmo resultado, mas carregando tudo antecipadamente (eager)."""
    with SessionLocal() as session:
        stmt = (
            select(Atendimento)
            .where(Atendimento.id_atendimento == id_atendimento)
            .options(
                joinedload(Atendimento.paciente),   # relação "to-one" -> JOIN
                joinedload(Atendimento.residente),  # relação "to-one" -> JOIN
                joinedload(Atendimento.preceptor),  # relação "to-one" -> JOIN
                joinedload(Atendimento.unidade),    # relação "to-one" opcional -> LEFT JOIN
                selectinload(Atendimento.procedimentos_realizados),  # coleção -> query em lote (IN)
            )
        )
        atendimento = session.scalars(stmt).unique().one_or_none()
        if atendimento is None:
            print("Atendimento não encontrado.")
            return

        # Tudo abaixo já está em memória, NENHUMA query extra é disparada aqui:
        print("Atendimento carregado (eager):", atendimento.id_atendimento)
        print("Paciente:", atendimento.paciente.nome)
        print("Residente:", atendimento.residente.nome)
        print("Preceptor:", atendimento.preceptor.nome)
        if atendimento.unidade:
            print("Unidade:", atendimento.unidade.nome)
        print("Qtd. procedimentos realizados:", len(atendimento.procedimentos_realizados))


# ---------------------------------------------------------------------------
# Novas consultas (100% SQLAlchemy ORM, sem SQL puro)
# ---------------------------------------------------------------------------

# --- Query 11 ------------------------------------------------------------
# Preceptores que supervisionaram residentes que atenderam pacientes
# flamenguistas (is_flamengo = true).
#
# Como cada linha de `atendimento` já amarra residente + preceptor + paciente
# na mesma consulta, basta filtrar os atendimentos cujo paciente é
# flamenguista e pegar os preceptores distintos envolvidos nesses
# atendimentos.
def preceptores_de_residentes_que_atenderam_flamenguistas():
    with SessionLocal() as session:
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


# --- Query 12 ------------------------------------------------------------
# Para cada paciente, exibe o último atendimento: data_hora, residente,
# preceptor e a lista de procedimentos realizados naquele atendimento.
#
# Estratégia: uma subquery com ROW_NUMBER() OVER (PARTITION BY id_paciente
# ORDER BY data_hora DESC) seleciona apenas a linha mais recente de cada
# paciente (rn == 1); depois usamos eager loading (joinedload/selectinload)
# para trazer paciente, residente, preceptor e procedimentos já resolvidos,
# evitando N+1 queries ao montar o resultado.
def ultimo_atendimento_por_paciente():
    with SessionLocal() as session:
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


# --- Query 13 ------------------------------------------------------------
# Percentual de procedimentos de alto risco realizados por cada residente.
#
# percentual = (quantidade de procedimentos de risco 'ALTO' realizados pelo
# residente / quantidade total de procedimentos realizados pelo residente) * 100
#
# Considera a coluna `quantidade` de ProcedimentoRealizado (e não apenas a
# contagem de linhas), pois ela reflete quantas vezes o procedimento foi de
# fato executado naquele atendimento. Residentes sem nenhum procedimento
# realizado aparecem com 0%, sem erro de divisão por zero (via CASE).
def percentual_procedimentos_alto_risco_por_residente():
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

    with SessionLocal() as session:
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


if __name__ == "__main__":
    # Exemplos de uso (comente/descomente conforme necessário e ajuste os IDs).
    # listar_atendimentos_por_paciente(1)
    # ranking_residentes_por_atendimentos()
    # demo_lazy_loading(1)
    # demo_eager_loading(1)
    pass