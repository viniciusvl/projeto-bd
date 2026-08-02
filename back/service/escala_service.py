from db.connect import get_session
from db.repository import escala_repository
from exceptions.errors import BadRequest, NotFound
from exceptions.repository_exceptions import ConflitoDeEscalaError, EntidadeNaoEncontradaError
from schemas.escala import ReajustarEscalaIn


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