from db.connect import get_connection


def reajustar_escala(id_residente, dia_origem, turno_origem, dia_destino, turno_destino):
    """Chama sp_reajustar_escala. Lança mysql.connector.Error em caso de conflito."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "CALL sp_reajustar_escala(%s, %s, %s, %s, %s)",
            (id_residente, dia_origem, turno_origem, dia_destino, turno_destino),
        )
        while cursor.nextset():
            pass
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
