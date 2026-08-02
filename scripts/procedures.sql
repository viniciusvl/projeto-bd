USE hospital;

DELIMITER //

-- ============================================================================
-- 1. sp_registrar_atendimento_completo
-- Insere atendimento e seus procedimentos (recebidos via JSON) atomicamente.
-- Exemplo de JSON de entrada: 
-- '[{"id_procedimento": 1, "quantidade": 1, "tempo_real": 15, "observacao": "Ok"}]'
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_registrar_atendimento_completo //

CREATE PROCEDURE sp_registrar_atendimento_completo(
    IN p_data_hora DATETIME,
    IN p_duracao_minutos INT,
    IN p_id_paciente INT,
    IN p_id_residente INT,
    IN p_id_preceptor INT,
    IN p_id_unidade INT,
    IN p_procedimentos_json JSON,
    OUT p_novo_id_atendimento INT
)
BEGIN
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_qtd_procedimentos INT DEFAULT 0;
    DECLARE v_id_proc INT;
    DECLARE v_qtd INT;
    DECLARE v_tempo INT;
    DECLARE v_obs TEXT;

    -- Em caso de qualquer erro SQL, reverte toda a transação
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1. Insere o Atendimento
    INSERT INTO atendimento (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor, id_unidade)
    VALUES (p_data_hora, p_duracao_minutos, p_id_paciente, p_id_residente, p_id_preceptor, p_id_unidade);

    SET p_novo_id_atendimento = LAST_INSERT_ID();

    -- 2. Processa a lista de procedimentos em JSON (se informada)
    IF p_procedimentos_json IS NOT NULL AND JSON_VALID(p_procedimentos_json) THEN
        SET v_qtd_procedimentos = JSON_LENGTH(p_procedimentos_json);

        WHILE v_i < v_qtd_procedimentos DO
            SET v_id_proc = JSON_UNQUOTE(JSON_EXTRACT(p_procedimentos_json, CONCAT('$[', v_i, '].id_procedimento')));
            SET v_qtd     = JSON_UNQUOTE(JSON_EXTRACT(p_procedimentos_json, CONCAT('$[', v_i, '].quantidade')));
            SET v_tempo   = JSON_UNQUOTE(JSON_EXTRACT(p_procedimentos_json, CONCAT('$[', v_i, '].tempo_real')));
            SET v_obs     = JSON_UNQUOTE(JSON_EXTRACT(p_procedimentos_json, CONCAT('$[', v_i, '].observacao')));

            INSERT INTO procedimento_realizado (
                id_atendimento, 
                id_procedimento, 
                quantidade, 
                tempo_real_minutos, 
                data_hora_inicio, 
                observacao
            )
            VALUES (
                p_novo_id_atendimento, 
                v_id_proc, 
                COALESCE(v_qtd, 1), 
                v_tempo, 
                p_data_hora, 
                v_obs
            );

            SET v_i = v_i + 1;
        END WHILE;
    END IF;

    COMMIT;
END //

-- ============================================================================
-- 2. sp_calcular_tempo_medio_espera
-- Calcula por unidade a média em minutos entre chegada (atendimento) e o 1º procedimento
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_calcular_tempo_medio_espera //

CREATE PROCEDURE sp_calcular_tempo_medio_espera()
BEGIN
    WITH primeiro_procedimento AS (
        SELECT 
            id_atendimento,
            MIN(data_hora_inicio) AS primeira_data_hora_inicio
        FROM procedimento_realizado
        WHERE data_hora_inicio IS NOT NULL
        GROUP BY id_atendimento
    )
    SELECT 
        u.id_unidade,
        u.nome AS unidade,
        COUNT(a.id_atendimento) AS total_atendimentos_analisados,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, a.data_hora, pp.primeira_data_hora_inicio)), 2) AS tempo_medio_espera_minutos
    FROM atendimento a
    JOIN unidade u ON a.id_unidade = u.id_unidade
    JOIN primeiro_procedimento pp ON a.id_atendimento = pp.id_atendimento
    GROUP BY u.id_unidade, u.nome;
END //

-- ============================================================================
-- 3. sp_reajustar_escala
-- Reajusta o dia e turno de todas as escalas de um residente salvaguardando conflitos
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_reajustar_escala //

CREATE PROCEDURE sp_reajustar_escala(
    IN p_id_residente INT,
    IN p_dia_origem ENUM('domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'),
    IN p_turno_origem ENUM('manha', 'tarde', 'noite'),
    IN p_dia_destino ENUM('domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'),
    IN p_turno_destino ENUM('manha', 'tarde', 'noite')
)
BEGIN
    DECLARE v_conflito INT DEFAULT 0;

    -- Em caso de erro, reverte as alterações
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Verifica se o remanejamento causará conflito de chave única UNIQUE(id_unidade, dia_semana, turno, id_residente)
    SELECT COUNT(*) INTO v_conflito
    FROM escala e_origem
    JOIN escala e_destino ON e_origem.id_unidade = e_destino.id_unidade
                         AND e_destino.dia_semana = p_dia_destino
                         AND e_destino.turno = p_turno_destino
                         AND e_destino.id_residente = p_id_residente
    WHERE e_origem.id_residente = p_id_residente
      AND e_origem.dia_semana = p_dia_origem
      AND e_origem.turno = p_turno_origem;

    IF v_conflito > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: Reajuste cancelado pois gera conflito de escala para o mesmo residente/unidade/dia/turno.';
    ELSE
        UPDATE escala
        SET dia_semana = p_dia_destino,
            turno = p_turno_destino
        WHERE id_residente = p_id_residente
          AND dia_semana = p_dia_origem
          AND turno = p_turno_origem;
    END IF;

    COMMIT;
END //

DELIMITER ;