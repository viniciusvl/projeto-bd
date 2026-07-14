from db.connect import executar_query


def criar_atendimento(data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor):
    sql = """
        INSERT INTO atendimento (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
        SELECT %s, %s, %s, %s, %s
        FROM DUAL
        WHERE EXISTS (SELECT 1 FROM paciente WHERE id_pessoa = %s)
                        AND EXISTS
                        (SELECT 1 FROM residente WHERE id_profissional = %s)
                        AND EXISTS
                        (SELECT 1 FROM preceptor WHERE id_profissional = %s)
    """
    rowcount, lastrowid = executar_query(
        sql,
        (
            data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor,
            id_paciente, id_residente, id_preceptor,
        ),
    )
    if rowcount == 0:
        return None
    return lastrowid


def listar_por_paciente(id_paciente):
    sql = "SELECT * FROM atendimento WHERE (id_paciente = %s) ORDER BY data_hora"
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
