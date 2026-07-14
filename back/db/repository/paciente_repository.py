from db.connect import executar_query


def listar_todos():
    sql = """
        SELECT
            pe.id_pessoa,
            pe.nome,
            pe.telefone,
            pa.num_convenio,
            pa.grupo_sanguineo,
            pa.estado,
            pa.cidade,
            pa.bairro,
            pa.logradouro,
            pa.numero
        FROM paciente pa
        JOIN pessoa pe ON pe.id_pessoa = pa.id_pessoa
        ORDER BY pe.nome
    """
    return executar_query(sql, fetch=True)


def atualizar(id_pessoa, num_convenio, estado, cidade, bairro, logradouro, numero):
    sql = """
        UPDATE paciente
        SET
            num_convenio = COALESCE(%s, num_convenio),
            estado = COALESCE(%s, estado),
            cidade = COALESCE(%s, cidade),
            bairro = COALESCE(%s, bairro),
            logradouro = COALESCE(%s, logradouro),
            numero = COALESCE(%s, numero)
        WHERE id_pessoa = %s
            AND %s IS NOT NULL
    """
    rowcount, _ = executar_query(
        sql,
        (num_convenio, estado, cidade, bairro, logradouro, numero, id_pessoa, id_pessoa),
    )
    return rowcount
