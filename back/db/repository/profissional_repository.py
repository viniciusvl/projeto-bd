from db.connect import executar_query


def listar_residentes():
    sql = """
        SELECT r.id_profissional, pe.nome
        FROM residente r
        JOIN pessoa pe ON pe.id_pessoa = r.id_profissional
        ORDER BY pe.nome
    """
    return executar_query(sql, fetch=True)


def listar_preceptores():
    sql = """
        SELECT pr.id_profissional, pe.nome
        FROM preceptor pr
        JOIN pessoa pe ON pe.id_pessoa = pr.id_profissional
        ORDER BY pe.nome
    """
    return executar_query(sql, fetch=True)
