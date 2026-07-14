USE hospital;

-- Ranking dos residentes por número de atendimentos realizados (mostrar nome e total)
SELECT 
    p.nome, 
    COUNT(atend.id_atendimento) AS total 
    FROM atendimento atend 
	INNER JOIN residente r ON atend.id_residente = r.id_profissional
	INNER JOIN profissional prof ON r.id_profissional = prof.id_pessoa
	INNER JOIN pessoa p ON prof.id_pessoa = p.id_pessoa

    GROUP BY p.id_pessoa, p.nome
	ORDER BY total DESC;

-- Listar os preceptores que supervisionaram mais de 5 atendimentos em um determinado mês
SELECT 
    p.nome AS nome_preceptor,
    COUNT(atend.id_atendimento) AS total_supervisoes
FROM atendimento atend
INNER JOIN preceptor prec ON atend.id_preceptor = prec.id_profissional
INNER JOIN profissional prof ON prec.id_profissional = prof.id_pessoa
INNER JOIN pessoa p ON prof.id_pessoa = p.id_pessoa
WHERE 
    atend.data_hora >= '2026-05-01 00:00:00' 
    AND atend.data_hora <= '2026-05-31 23:59:59'
GROUP BY p.id_pessoa, p.nome
HAVING COUNT(atend.id_atendimento) > 5;

-- Para cada unidade, mostrar a quantidade de plantões escalados por residente no mês corrente
SELECT
    u.nome AS unidade,
    p.nome AS residente,
    COUNT(*) AS quantidade_plantoes
FROM escala e
JOIN unidade u
    ON u.id_unidade = e.id_unidade
JOIN residente r
    ON r.id_profissional = e.id_residente
JOIN pessoa p
    ON p.id_pessoa = r.id_profissional
GROUP BY
    u.nome,
    p.nome
ORDER BY
    u.nome,
    quantidade_plantoes DESC;

-- Listar pacientes que nunca realizaram nenhum procedimento de nível de risco 'ALTO'
SELECT
    p.nome AS paciente
FROM paciente pa
JOIN pessoa p
    ON p.id_pessoa = pa.id_pessoa
WHERE NOT EXISTS (

    SELECT 1
    FROM atendimento atend
    JOIN procedimento_realizado pr ON pr.id_atendimento = atend.id_atendimento
    JOIN procedimento proc ON proc.id_procedimento = pr.id_procedimento
    WHERE
        atend.id_paciente = pa.id_pessoa
        AND proc.risco = 'alto'

);