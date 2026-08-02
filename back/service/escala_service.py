import mysql.connector

from db.repository import escala_repository
from exceptions.errors import BadRequest
from schemas.escala import ReajustarEscalaIn


def reajustar_escala(data: ReajustarEscalaIn) -> dict:
    try:
        escala_repository.reajustar_escala(
            data.id_residente,
            data.dia_origem.value,
            data.turno_origem.value,
            data.dia_destino.value,
            data.turno_destino.value,
        )
        return {"message": "Escala reajustada com sucesso."}
    except mysql.connector.Error as e:
        # sp_reajustar_escala usa SIGNAL SQLSTATE '45000' para conflito
        raise BadRequest(str(e.msg))
