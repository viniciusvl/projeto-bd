CREATE TRIGGER trg_check_sobreposicao_escala_insert
BEFORE INSERT ON escala
FOR EACH ROW
BEGIN
  DECLARE conflict_count INT;

  SELECT COUNT(*) INTO conflict_count
  FROM escala
  WHERE id_residente = NEW.id_residente
    AND dia_semana   = NEW.dia_semana
    AND turno        = NEW.turno
    AND id_unidade  != NEW.id_unidade;

  IF conflict_count > 0 THEN -- se encontrou alguma irregularidade
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'O residente ja foi escalado em outra unidade neste momento';
  END IF;
END;

CREATE TRIGGER trg_check_sobreposicao_escala_update
BEFORE UPDATE ON escala
FOR EACH ROW
BEGIN
  DECLARE conflict_count INT;

  SELECT COUNT(*) INTO conflict_count
  FROM escala
  WHERE id_residente = NEW.id_residente
    AND dia_semana   = NEW.dia_semana
    AND turno        = NEW.turno
    AND id_unidade  != NEW.id_unidade
    AND id_escala   != NEW.id_escala; -- ignorando si mesma

  IF conflict_count > 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'O residente ja foi escalado em outra unidade neste momento';
  END IF;
END;

CREATE TRIGGER trg_audita_atendimento_insert
AFTER INSERT ON atendimento
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_atendimento (id_atendimento, operacao, data_hora_novo, duracao_minutos_novo, id_paciente_novo,
    id_residente_novo, id_preceptor_novo, id_unidade_novo, usuario_db)
    VALUES (NEW.id_atendimento, 'INSERT', NEW.data_hora, NEW.duracao_minutos, NEW.id_paciente, NEW.id_residente,
    NEW.id_preceptor, NEW.id_unidade, USER());
END;

CREATE TRIGGER trg_audita_atendimento_update
AFTER UPDATE ON atendimento
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_atendimento (id_atendimento, operacao,
    data_hora_antigo, duracao_minutos_antigo, id_paciente_antigo,
    id_residente_antigo, id_preceptor_antigo, id_unidade_antigo,
    data_hora_novo, duracao_minutos_novo, id_paciente_novo,
    id_residente_novo, id_preceptor_novo, id_unidade_novo, usuario_db)
    VALUES (NEW.id_atendimento, 'UPDATE',
    OLD.data_hora, OLD.duracao_minutos, OLD.id_paciente,
    OLD.id_residente, OLD.id_preceptor, OLD.id_unidade,
    NEW.data_hora, NEW.duracao_minutos, NEW.id_paciente,
    NEW.id_residente, NEW.id_preceptor, NEW.id_unidade, USER());
END;

CREATE TRIGGER trg_audita_atendimento_delete
AFTER DELETE ON atendimento
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_atendimento (id_atendimento, operacao,
    data_hora_antigo, duracao_minutos_antigo, id_paciente_antigo,
    id_residente_antigo, id_preceptor_antigo, id_unidade_antigo,
    usuario_db)
    VALUES (OLD.id_atendimento, 'DELETE',
    OLD.data_hora, OLD.duracao_minutos, OLD.id_paciente,
    OLD.id_residente, OLD.id_preceptor, OLD.id_unidade, USER());
END;

CREATE TRIGGER trg_atualiza_media_procedimentos_insert
AFTER INSERT ON procedimento_realizado
FOR EACH ROW
BEGIN
    UPDATE procedimento
    SET tempo_medio_minutos = (
        SELECT AVG(tempo_real_minutos)
        FROM procedimento_realizado
        WHERE id_procedimento = NEW.id_procedimento
    )
    WHERE id_procedimento = NEW.id_procedimento;
END;

CREATE TRIGGER trg_atualiza_media_procedimentos_update
AFTER UPDATE ON procedimento_realizado
FOR EACH ROW
BEGIN
    UPDATE procedimento
    SET tempo_medio_minutos = (
        SELECT AVG(tempo_real_minutos)
        FROM procedimento_realizado
        WHERE id_procedimento = NEW.id_procedimento
    )
    WHERE id_procedimento = NEW.id_procedimento;
END;

CREATE TRIGGER trg_atualiza_media_procedimentos_delete
AFTER DELETE ON procedimento_realizado
FOR EACH ROW
BEGIN
    UPDATE procedimento
    SET tempo_medio_minutos = (
        SELECT COALESCE(AVG(tempo_real_minutos), 0) -- caso a tabela de procedimentos realizados fique vazia
        FROM procedimento_realizado
        WHERE id_procedimento = OLD.id_procedimento
    )
    WHERE id_procedimento = OLD.id_procedimento;
END;