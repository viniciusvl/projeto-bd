import json

from db.connect import executar_query, get_connection


def criar_atendimento(data_hora, duracao_minutos, id_paciente, id_residente,
                      id_preceptor, id_unidade, procedimentos: list):
    """Chama sp_registrar_atendimento_completo via variáveis de sessão MySQL."""
    procedimentos_json = json.dumps(procedimentos) if procedimentos else None
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "CALL sp_registrar_atendimento_completo(%s, %s, %s, %s, %s, %s, %s, @novo_id)",
            (data_hora, duracao_minutos, id_paciente, id_residente,
             id_preceptor, id_unidade, procedimentos_json),
        )
        # Consome todos os result sets da procedure antes de executar outro SELECT
        while cursor.nextset():
            pass
        cursor.execute("SELECT @novo_id AS novo_id")
        row = cursor.fetchone()
        conn.commit()
        return row["novo_id"] if row else None
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def listar_por_paciente(id_paciente):
    sql = """
        SELECT
            a.id_atendimento,
            a.data_hora,
            a.duracao_minutos,
            a.id_paciente,
            a.id_residente,
            a.id_preceptor,
            a.id_unidade,
            res.nome AS nome_residente,
            prec.nome AS nome_preceptor
        FROM atendimento a
        JOIN pessoa res ON res.id_pessoa = a.id_residente
        JOIN pessoa prec ON prec.id_pessoa = a.id_preceptor
        WHERE a.id_paciente = %s
        ORDER BY a.data_hora
    """
    return executar_query(sql, (id_paciente,), fetch=True)


def tempo_medio():
    sql = """
        SELECT
            r.id_profissional AS id_residente,
            p.nome AS nome_residente,
            ROUND(AVG(a.duracao_minutos), 1) AS tempo_medio_minutos
        FROM residente r
        JOIN pessoa p ON r.id_profissional = p.id_pessoa
        LEFT JOIN atendimento a ON r.id_profissional = a.id_residente
        GROUP BY r.id_profissional, p.nome
        ORDER BY tempo_medio_minutos DESC
    """
    return executar_query(sql, fetch=True)


def tempo_medio_espera():
    """Chama sp_calcular_tempo_medio_espera e retorna o result set."""
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("CALL sp_calcular_tempo_medio_espera()")
        resultado = cursor.fetchall()
        # Consome result sets restantes para evitar erros de sincronização
        while cursor.nextset():
            pass
        conn.commit()
        return resultado
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

