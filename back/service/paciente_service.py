import mysql.connector

from db.repository import paciente_repository
from exceptions.errors import BadRequest, NotFound
from schemas.paciente import PacienteCreate, PacienteUpdate

GRUPOS_SANGUINEOS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


def _limpar(valor):
    if valor is None:
        return None
    valor = valor.strip()
    return valor or None


def listar_todos():
    return paciente_repository.listar_todos()


def criar(paciente: PacienteCreate):
    nome = paciente.nome.strip()
    cpf = paciente.cpf.strip()
    if not nome:
        raise BadRequest("Nome é obrigatório.")
    if not cpf:
        raise BadRequest("CPF é obrigatório.")

    grupo = _limpar(paciente.grupo_sanguineo)
    if grupo is not None and grupo not in GRUPOS_SANGUINEOS:
        raise BadRequest("Grupo sanguíneo inválido.")

    dados = dict(
        num_convenio=_limpar(paciente.num_convenio),
        grupo_sanguineo=grupo,
        estado=_limpar(paciente.estado),
        cidade=_limpar(paciente.cidade),
        bairro=_limpar(paciente.bairro),
        logradouro=_limpar(paciente.logradouro),
        numero=_limpar(paciente.numero),
    )

    try:
        novo_id = paciente_repository.criar(
            nome=nome,
            cpf=cpf,
            data_nascimento=paciente.data_nascimento,
            is_flamengo=paciente.is_flamengo,
            telefone=_limpar(paciente.telefone),
            **dados,
        )
    except mysql.connector.IntegrityError as exc:
        if exc.errno == 1062:
            raise BadRequest("Já existe um paciente com esse CPF.")
        raise BadRequest("Não foi possível cadastrar o paciente.")

    return {"id_pessoa": novo_id, "nome": nome, "telefone": _limpar(paciente.telefone), **dados}


def atualizar(paciente: PacienteUpdate):
    linhas = paciente_repository.atualizar(
        paciente.id_pessoa,
        paciente.num_convenio,
        paciente.estado,
        paciente.cidade,
        paciente.bairro,
        paciente.logradouro,
        paciente.numero,
    )
    if linhas == 0:
        raise NotFound("Paciente não encontrado.")
    return {"id_pessoa": paciente.id_pessoa, "atualizado": True}
