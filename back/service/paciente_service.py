from sqlalchemy.exc import IntegrityError

from db.connect import get_session
from db.repository import paciente_repository
from exceptions.errors import BadRequest, NotFound
from exceptions.repository_exceptions import EntidadeNaoEncontradaError
from schemas.paciente import PacienteCreate, PacienteUpdate

GRUPOS_SANGUINEOS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


def _limpar(valor):
    if valor is None:
        return None
    valor = valor.strip()
    return valor or None


def listar_todos():
    with get_session() as session:
        return paciente_repository.listar_todos(session)


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
        with get_session() as session:
            novo_id = paciente_repository.criar(
                session,
                nome=nome,
                cpf=cpf,
                data_nascimento=paciente.data_nascimento,
                is_flamengo=paciente.is_flamengo,
                telefone=_limpar(paciente.telefone),
                **dados,
            )
    except IntegrityError as exc:
        # Antes checávamos mysql.connector.IntegrityError.errno == 1062;
        # com o ORM, o driver original fica em exc.orig (pymysql), então
        # olhamos o errno por lá (com fallback pra exc.args).
        orig = exc.orig
        errno = getattr(orig, "errno", None)
        if errno is None and getattr(orig, "args", None):
            errno = orig.args[0]
        if errno == 1062:
            raise BadRequest("Já existe um paciente com esse CPF.")
        raise BadRequest("Não foi possível cadastrar o paciente.")

    return {"id_pessoa": novo_id, "nome": nome, "telefone": _limpar(paciente.telefone), **dados}


def atualizar(paciente: PacienteUpdate):
    with get_session() as session:
        try:
            paciente_repository.atualizar(
                session,
                paciente.id_pessoa,
                paciente.num_convenio,
                paciente.estado,
                paciente.cidade,
                paciente.bairro,
                paciente.logradouro,
                paciente.numero,
            )
        except EntidadeNaoEncontradaError as exc:
            raise NotFound(str(exc))
    return {"id_pessoa": paciente.id_pessoa, "atualizado": True}