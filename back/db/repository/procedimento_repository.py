from db.connect import executar_query


def listar_por_atendimento(id_atendimento):
    sql = """
        SELECT
            pr.id_procedimento,
            p.nome AS nome_procedimento,
            pr.quantidade,
            pr.tempo_real_minutos AS tempo_real,
            pr.faturado
        FROM procedimento_realizado pr
        JOIN procedimento p ON pr.id_procedimento = p.id_procedimento
        WHERE pr.id_atendimento = %s
    """
    return executar_query(sql, (id_atendimento,), fetch=True)


def remover(id_atendimento, id_procedimento):
    sql = """
        DELETE FROM procedimento_realizado
        WHERE id_atendimento = %s
          AND id_procedimento = %s
          AND faturado = FALSE
    """
    rowcount, _ = executar_query(sql, (id_atendimento, id_procedimento))
    return rowcount
