-- 1. Cadastra um novo atendimento, somente se exister o paciente, residente e preceptor.
INSERT INTO atendimento (data_hora, duracao_minutos, id_paciente,  id_residente,  id_preceptor)
SELECT @_data_hora, @_duracao_minutos, @_id_paciente, @_id_residente, @_id_preceptor
FROM DUAL
WHERE EXISTS (SELECT 1 FROM paciente WHERE id_pessoa = @_id_paciente)  
                AND EXISTS
                (SELECT 1 FROM residente WHERE id_profissional = @_id_residente)
                AND EXISTS
                (SELECT 1 FROM preceptor WHERE id_profissional = @_id_preceptor);

-- 2. Lista todos os atendimentos de um determinado cliente ordenado pela data.
SELECT * FROM atendimento WHERE (id_paciente = @_id_paciente_especifico) ORDER BY data_hora;

-- 3. Listar os procedimentos realizados em um atendimento (nome do procedimento, quantidade e tempo real).
SELECT 
    p.nome AS nome_procedimento,
    pr.quantidade,
    pr.tempo_real_minutos AS tempo_real
FROM procedimento_realizado pr
JOIN procedimento p ON pr.id_procedimento = p.id_procedimento
WHERE pr.id_atendimento = @_id_atendimento;

--- 4. Atualiza os dados de um cliente. (endereço OU convênio)
UPDATE paciente
SET 
    num_convenio = COALESCE(@_convenio, num_convenio),
    estado = COALESCE(@_estado, estado),
    cidade = COALESCE(@_cidade, cidade),
    bairro = COALESCE(@_bairro, bairro),
    logradouro = COALESCE(@_logradouro, logradouro),
    numero = COALESCE(@_numero, numero)
WHERE id_pessoa = @paciente_mudado
    AND @paciente_mudado IS NOT NULL;

-- 5. Remove um procedimento realizado. (Somente se ainda não tiver sido faturado)
DELETE FROM procedimento_realizado 
WHERE id_atendimento = @_id_atendimento_excluir 
  AND id_procedimento = @_id_procedimento_excluir
  AND faturado = FALSE;

-- 6. Lista o tempo médio de atendimento por atendente.
SELECT 
    r.id_profissional AS id_residente,
    p.nome AS nome_residente,
    ROUND(AVG(a.duracao_minutos), 1) AS tempo_medio_minutos
FROM residente r
JOIN pessoa p ON r.id_profissional = p.id_pessoa
LEFT JOIN atendimento a ON r.id_profissional = a.id_residente
GROUP BY r.id_profissional, p.nome
ORDER BY tempo_medio_minutos DESC;