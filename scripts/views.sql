USE hospital;

-- ============================================================================
-- 1. vw_pacientes_internados
-- Lista os pacientes atualmente internados (data_saida é NULL)
-- ============================================================================
DROP VIEW IF EXISTS vw_pacientes_internados;

CREATE VIEW vw_pacientes_internados AS
SELECT 
    p.id_pessoa AS id_paciente,
    p.nome AS nome_paciente,
    p.cpf,
    pac.num_convenio,
    u.nome AS unidade_internacao,
    i.data_entrada,
    i.motivo
FROM internacao i
JOIN paciente pac ON i.id_paciente = pac.id_pessoa
JOIN pessoa p ON pac.id_pessoa = p.id_pessoa
JOIN unidade u ON i.id_unidade = u.id_unidade
WHERE i.data_saida IS NULL;

-- ============================================================================
-- 2. vw_residentes_sem_supervisor (VERSÃO CORRIGIDA)
-- Residentes escalados cujo preceptor:
-- a) Não possui titulação de 'Doutor' / 'Doutorado'
-- b) OU não está com supervisão ativa (ex: id_preceptor é NULL na escala)
-- ============================================================================
DROP VIEW IF EXISTS vw_residentes_sem_supervisor;

CREATE VIEW vw_residentes_sem_supervisor AS
SELECT 
    e.id_escala,
    u.nome AS nome_unidade,
    e.dia_semana,
    e.turno,
    p_res.nome AS nome_residente,
    r.ano_residencia,
    COALESCE(p_prec.nome, 'SEM PRECEPTOR ATRIBUÍDO') AS nome_preceptor,
    COALESCE(pr.titulacao, 'NENHUMA') AS titulacao_preceptor,
    CASE 
        WHEN e.id_preceptor IS NULL THEN 'Sem supervisão ativa (Sem preceptor no plantão)'
        WHEN LOWER(pr.titulacao) NOT LIKE '%doutor%' THEN 'Preceptor sem titulação de Doutor'
        ELSE 'Sem supervisão ativa'
    END AS motivo_alerta
FROM escala e
JOIN residente r ON e.id_residente = r.id_profissional
JOIN pessoa p_res ON r.id_profissional = p_res.id_pessoa
JOIN unidade u ON e.id_unidade = u.id_unidade
LEFT JOIN preceptor pr ON e.id_preceptor = pr.id_profissional
LEFT JOIN pessoa p_prec ON pr.id_profissional = p_prec.id_pessoa
WHERE e.id_preceptor IS NULL 
   OR LOWER(pr.titulacao) NOT LIKE '%doutor%';

-- ============================================================================
-- 3. vw_estatisticas_atendimentos_mensal
-- Agregação por mês/ano e unidade: total de atendimentos, duração média e procedimento mais comum
-- ============================================================================
DROP VIEW IF EXISTS vw_estatisticas_atendimentos_mensal;

CREATE VIEW vw_estatisticas_atendimentos_mensal AS
WITH resumo_atendimento AS (
    SELECT 
        YEAR(a.data_hora) AS ano,
        MONTH(a.data_hora) AS mes,
        a.id_unidade,
        u.nome AS nome_unidade,
        COUNT(DISTINCT a.id_atendimento) AS total_atendimentos,
        ROUND(AVG(a.duracao_minutos), 2) AS media_duracao_minutos
    FROM atendimento a
    JOIN unidade u ON a.id_unidade = u.id_unidade
    GROUP BY YEAR(a.data_hora), MONTH(a.data_hora), a.id_unidade, u.nome
),
contagem_procedimentos AS (
    SELECT 
        YEAR(a.data_hora) AS ano,
        MONTH(a.data_hora) AS mes,
        a.id_unidade,
        pr.id_procedimento,
        proc.nome AS nome_procedimento,
        SUM(pr.quantidade) AS total_executado,
        ROW_NUMBER() OVER (
            PARTITION BY YEAR(a.data_hora), MONTH(a.data_hora), a.id_unidade 
            ORDER BY SUM(pr.quantidade) DESC
        ) AS rank_proc
    FROM atendimento a
    JOIN procedimento_realizado pr ON a.id_atendimento = pr.id_atendimento
    JOIN procedimento proc ON pr.id_procedimento = proc.id_procedimento
    GROUP BY YEAR(a.data_hora), MONTH(a.data_hora), a.id_unidade, pr.id_procedimento, proc.nome
)
SELECT 
    ra.ano,
    ra.mes,
    ra.nome_unidade,
    ra.total_atendimentos,
    ra.media_duracao_minutos,
    COALESCE(cp.nome_procedimento, 'Nenhum procedimento registrado') AS procedimento_mais_comum
FROM resumo_atendimento ra
LEFT JOIN contagem_procedimentos cp 
       ON ra.ano = cp.ano 
      AND ra.mes = cp.mes 
      AND ra.id_unidade = cp.id_unidade 
      AND cp.rank_proc = 1;