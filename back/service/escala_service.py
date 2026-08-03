from sqlalchemy.exc import DBAPIError, IntegrityError

from db.connect import get_session
from db.repository import escala_repository
from exceptions.errors import BadRequest, NotFound
from exceptions.repository_exceptions import ConflitoDeEscalaError, EntidadeNaoEncontradaError
from schemas.escala import EscalaCreate, ReajustarEscalaIn


def listar():
    with get_session() as session:
        return escala_repository.listar_todas(session)


def criar(data: EscalaCreate) -> dict:
    with get_session() as session:
        try:
            escala = escala_repository.criar(
                session,
                data.id_unidade,
                data.dia_semana.value,
                data.turno.value,
                data.id_residente,
                data.id_preceptor,
            )
            resultado = {
                "id_escala": escala.id_escala,
                "id_unidade": escala.id_unidade,
                "nome_unidade": escala.unidade.nome,
                "dia_semana": escala.dia_semana,
                "turno": escala.turno,
                "id_residente": escala.id_residente,
                "nome_residente": escala.residente.nome,
                "id_preceptor": escala.id_preceptor,
                "nome_preceptor": escala.preceptor.nome,
            }
        except IntegrityError:
            raise BadRequest(
                "Já existe uma escala idêntica (mesma unidade, dia, turno e residente)."
            )
        except DBAPIError as exc:
            # trigger trg_check_sobreposicao_escala_insert usa SIGNAL 45000 com
            # mensagem própria; repassamos essa mensagem quando disponível.
            orig = getattr(exc, "orig", None)
            args = getattr(orig, "args", ())
            detalhe = args[1] if len(args) > 1 else "conflito no banco de dados"
            raise BadRequest(f"Não foi possível criar a escala: {detalhe}")
    return resultado


def reajustar_escala(data: ReajustarEscalaIn) -> dict:
    with get_session() as session:
        try:
            escala_repository.reajustar_escala(
                session,
                data.id_residente,
                data.dia_origem.value,
                data.turno_origem.value,
                data.dia_destino.value,
                data.turno_destino.value,
            )
        except EntidadeNaoEncontradaError as exc:
            raise NotFound(str(exc))
        except ConflitoDeEscalaError as exc:
            raise BadRequest(str(exc))
    return {"message": "Escala reajustada com sucesso."}