"""Repository de Paciente (SQLAlchemy ORM)."""

from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from exceptions.repository_exceptions import EntidadeNaoEncontradaError
from db.models import Paciente


def criar(
    session: Session,
    nome: str,
    cpf: str,
    data_nascimento: date,
    is_flamengo: bool,
    telefone: Optional[str],
    num_convenio: Optional[str],
    grupo_sanguineo: Optional[str],
    estado: Optional[str],
    cidade: Optional[str],
    bairro: Optional[str],
    logradouro: Optional[str],
    numero: Optional[str],
) -> int:
    """
    Substitui os 2 INSERTs manuais (pessoa + paciente). Como `Paciente`
    usa herança joined-table de `Pessoa`, um único objeto `Paciente` já
    gera o INSERT nas duas tabelas. `flush()` garante que `id_pessoa` já
    está preenchido antes de retornar, sem commitar a transação (quem
    commita é o service, via `get_session()`) — é nesse momento que uma
    violação de UNIQUE (ex.: CPF duplicado) é detectada e sobe como
    `sqlalchemy.exc.IntegrityError` para o service tratar.
    """
    novo_paciente = Paciente(
        nome=nome,
        cpf=cpf,
        data_nascimento=data_nascimento,
        is_flamengo=is_flamengo,
        telefone=telefone,
        num_convenio=num_convenio,
        grupo_sanguineo=grupo_sanguineo,
        estado=estado,
        cidade=cidade,
        bairro=bairro,
        logradouro=logradouro,
        numero=numero,
    )
    session.add(novo_paciente)
    session.flush()
    return novo_paciente.id_pessoa


def listar_todos(session: Session):
    stmt = select(
        Paciente.id_pessoa,
        Paciente.nome,  # herdado de Pessoa
        Paciente.telefone,  # herdado de Pessoa
        Paciente.num_convenio,
        Paciente.grupo_sanguineo,
        Paciente.estado,
        Paciente.cidade,
        Paciente.bairro,
        Paciente.logradouro,
        Paciente.numero,
    ).order_by(Paciente.nome)
    return session.execute(stmt).all()


def atualizar(
    session: Session,
    id_pessoa: int,
    num_convenio: Optional[str] = None,
    estado: Optional[str] = None,
    cidade: Optional[str] = None,
    bairro: Optional[str] = None,
    logradouro: Optional[str] = None,
    numero: Optional[str] = None,
) -> Paciente:
    """Atualiza endereço/convênio, preservando valores atuais quando o parâmetro vem None
    (equivalente ao COALESCE(%s, coluna) do SQL puro)."""
    paciente = session.get(Paciente, id_pessoa)
    if paciente is None:
        raise EntidadeNaoEncontradaError(f"Paciente {id_pessoa} não encontrado.")

    paciente.num_convenio = num_convenio if num_convenio is not None else paciente.num_convenio
    paciente.estado = estado if estado is not None else paciente.estado
    paciente.cidade = cidade if cidade is not None else paciente.cidade
    paciente.bairro = bairro if bairro is not None else paciente.bairro
    paciente.logradouro = logradouro if logradouro is not None else paciente.logradouro
    paciente.numero = numero if numero is not None else paciente.numero

    return paciente