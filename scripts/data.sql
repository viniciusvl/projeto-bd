USE hospital;

SET NAMES 'utf8mb4';

-- 1. pessoa (19 registros: 7 pacientes + 6 residentes + 6 preceptores)
INSERT INTO pessoa (id_pessoa, nome, cpf, data_nascimento, is_flamengo, telefone) VALUES
-- Pacientes (1-7)
(1,  'Maria Silva', '123.456.789-01', '1963-03-14', FALSE, '(83) 99812-3401'),
(2,  'Pedro Souza', '234.567.890-12', '1980-07-22', TRUE,  '(81) 99834-5602'),
(3,  'Ana Oliveira', '345.678.901-23', '1997-11-05', FALSE, '(71) 99756-7803'),
(4,  'Evandro Policarpo', '456.789.012-34', '1954-01-30', TRUE,  '(91) 99678-9004'),
(5,  'Lucia Ferreira', '567.890.123-45', '1986-09-18', FALSE, '(21) 99590-1205'),
(6,  'Carlos Souza', '678.901.234-56', '1970-05-25', FALSE, '(38) 99412-3406'),
(7,  'Fernanda Lima', '789.012.345-67', '2006-02-08', TRUE,  '(11) 99334-5607'),
-- Residentes (8-13)
(8,  'Dr. Vinícius, O índio', '111.222.333-44', '1995-06-10', FALSE, '(83) 99111-2208'),
(9,  'Dra. Camila Rocha', '222.333.444-55', '1993-04-17', TRUE,  '(83) 99222-3309'),
(10, 'Dr. Vinícius Mandacaru', '333.444.555-66', '1997-08-29', FALSE, '(83) 99333-4410'),
(11, 'Dra. Beatriz Nunes', '444.555.666-77', '2000-12-01', FALSE, '(41) 99444-5511'),
(12, 'Dr. Thiago Barros', '555.666.777-88', '1991-02-14', TRUE,  '(55) 99555-6612'),
(13, 'Dra. Isabela Pires', '666.777.888-99', '1996-10-23', FALSE, '(81) 99666-7713'),
-- Preceptores (14-19)
(14, 'Dr. Fernando Dias', '777.888.999-00', '1975-03-05', FALSE, '(83) 99777-8814'),
(15, 'Dra. Patricia Campos', '888.999.000-11', '1978-07-19', FALSE, '(19) 99888-9915'),
(16, 'Dr. Eduardo Vieira', '999.000.111-22', '1982-11-11', TRUE,  '(28) 99999-0016'),
(17, 'Dra. Adriana Lopes', '000.111.222-33', '1970-05-27', FALSE, '(38) 99000-1117'),
(18, 'Dr. Marcos Ribeiro', '111.000.222-33', '1985-09-03', FALSE, '(38) 99111-0018'),
(19, 'Dra. Sandra Melo', '222.000.333-44', '1988-01-16', TRUE,  '(81) 99222-0019');

-- 2. paciente (7 registros)
INSERT INTO paciente (id_pessoa, num_convenio, grupo_sanguineo, estado, cidade, bairro, logradouro, numero) VALUES
(1, 'CONV-1001', 'O+',  'PB', 'João Pessoa', 'Cristo Redentor', 'Av. Boa Viagem', '1200'),
(2, 'CONV-2045', 'B+',  'PB', 'Aguiar', 'Valentina', 'Rua do Sol', '345'),
(3, 'CONV-3089', 'AB-', 'SP', 'Osasco', 'Bela Vista', 'Rua do Prado', '78'),
(4, 'CONV-4012', 'A+',  'RJ', 'Niterói', 'Prazeres', 'Rua dos Navegantes', '560'),
(5, 'CONV-5077', 'O-',  'PB', 'Sapé', 'Cururu', 'Rua da Aurora', '920'),
(6, 'CONV-6033', 'B+',  'PE', 'Olinda', 'Olinda Centro', 'Rua Barreto de Menezes','412'),
(7, 'CONV-7021', 'A+',  'PE', 'Jaboatao', 'Barro', 'Rua Tamandaré', '187');

-- 3. alergia_paciente (5 registros em 4 pacientes)
INSERT INTO alergia_paciente (id_pessoa, alergia) VALUES
(1, 'Penicilina'),
(2, 'Dipirona'),
(3, 'Latex'),
(3, 'Iodo'),
(4, 'Aspirina');

-- 4. profissional (12 registros)
INSERT INTO profissional (id_pessoa, crm, data_admissao) VALUES
-- Residentes
(8,  'CRM/SP-12345', '2023-02-01'),
(9,  'CRM/PB-23456', '2022-08-15'),
(10, 'CRM/RJ-34567', '2024-03-10'),
(11, 'CRM/PB-45678', '2025-01-20'),
(12, 'CRM/PE-56789', '2021-07-01'),
(13, 'CRM/RR-67890', '2023-09-05'),
-- Preceptores
(14, 'CRM/SC-11111', '2010-04-12'),
(15, 'CRM/SG-22222', '2012-11-20'),
(16, 'CRM/SP-33333', '2015-06-08'),
(17, 'CRM/DF-44444', '2008-01-30'),
(18, 'CRM/PB-55555', '2017-09-14'),
(19, 'CRM/RJ-66666', '2019-03-22');

-- 5. preceptor (6 registros)
INSERT INTO preceptor (id_profissional, titulacao) VALUES
(14, 'Doutorado'),
(15, 'Mestrado'),
(16, 'Especializacao'),
(17, 'Doutorado'),
(18, 'Mestrado'),
(19, 'Especializacao');

-- 6. residente (6 registros)
INSERT INTO residente (id_profissional, ano_residencia) VALUES
(8,  2024),
(9,  2023),
(10, 2025),
(11, 2026),
(12, 2022),
(13, 2024);

-- 7. especialidade (6 registros)
INSERT INTO especialidade (id_especialidade, nome) VALUES
(1, 'Cardiologia'),
(2, 'Neurologia'),
(3, 'Ortopedia'),
(4, 'Pediatria'),
(5, 'Clinica Geral'),
(6, 'Cirurgia Geral');

-- 8. profissional_especialidade (12 registros, 1-2 por profissional)
INSERT INTO profissional_especialidade (id_profissional, id_especialidade) VALUES
-- Residentes
(8,  1),   -- Rafael -> Cardiologia
(9,  2),   -- Camila -> Neurologia
(9,  4),   -- Camila -> Pediatria
(10, 3),   -- Lucas  -> Ortopedia
(11, 5),   -- Beatriz -> Clinica Geral
(12, 6),   -- Thiago -> Cirurgia Geral
(12, 3),   -- Thiago -> Ortopedia
(13, 1),   -- Isabela -> Cardiologia
-- Preceptores
(14, 1),   -- Fernando -> Cardiologia
(15, 2),   -- Patricia -> Neurologia
(16, 3),   -- Eduardo -> Ortopedia
(17, 4),   -- Adriana -> Pediatria
(17, 5),   -- Adriana -> Clinica Geral
(18, 6),   -- Marcos -> Cirurgia Geral
(19, 5);   -- Sandra -> Clinica Geral

-- 9. procedimento (7 registros)
INSERT INTO procedimento (id_procedimento, codigo, nome, tempo_medio_minutos, risco) VALUES
(1, 'EC001', 'Eletrocardiograma',               15, 'baixo'),
(2, 'RX001', 'Raio-X Torax',                    20, 'baixo'),
(3, 'SU001', 'Sutura de Ferimento',             30, 'medio'),
(4, 'IO001', 'Intubacao Orotraqueal',           10, 'alto'),
(5, 'PV001', 'Puncao Venosa',                    5, 'baixo'),
(6, 'CU001', 'Curativo',                        15, 'baixo'),
(7, 'AV001', 'Aspiracao de Vias Aereas',        10, 'alto');

-- 10. unidade (4 registros)
INSERT INTO unidade (id_unidade, nome, tipo, capacidade_leitos) VALUES
(1, 'UTI Adulto',            'UTI',               20),
(2, 'Pronto Socorro',        'Emergencia',        30),
(3, 'Ambulatorio Pediatria', 'Consultorio',       10),
(4, 'Bloco Cirurgico',       'Centro Cirurgico',   8);

-- 11. atendimento (12 registros)
INSERT INTO atendimento (id_atendimento, data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor) VALUES
(1,  '2026-01-15 08:30:00', 45,  1,  8,  14),   -- Maria  + Rafael + Fernando (Cardio)
(2,  '2026-01-22 14:00:00', 30,  2,  9,  15),   -- Joao   + Camila + Patricia (Neuro)
(3,  '2026-02-03 09:15:00', 60,  3, 10,  16),   -- Ana    + Lucas  + Eduardo (Ortop)
(4,  '2026-02-10 11:00:00', 90,  4, 12,  18),   -- Pedro  + Thiago + Marcos (Cirurg)
(5,  '2026-02-28 16:45:00', 20,  5, 13,  14),   -- Lucia  + Isabela + Fernando (Cardio)
(6,  '2026-03-05 07:00:00', 120, 1, 11,  17),   -- Maria  + Beatriz + Adriana (Pedia/Clin)
(7,  '2026-03-18 10:30:00', 40,  6,  8,  14),   -- Carlos + Rafael + Fernando (Cardio)
(8,  '2026-04-02 13:00:00', 25,  7,  9,  15),   -- Fernanda + Camila + Patricia (Neuro)
(9,  '2026-04-15 15:30:00', 55,  2, 10,  16),   -- Joao   + Lucas  + Eduardo (Ortop)
(10, '2026-05-10 08:00:00', 35,  3, 12,  18),   -- Ana    + Thiago + Marcos (Cirurg)
(11, '2026-06-01 19:00:00', 70,  4, 13,  19),   -- Pedro  + Isabela + Sandra (Clin)
(12, '2026-07-08 22:15:00', 15,  5, 11,  17);   -- Lucia  + Beatriz + Adriana (Clin)

-- 12. procedimento_realizado (13 registros)
INSERT INTO procedimento_realizado (id_atendimento, id_procedimento, quantidade, faturado, tempo_real_minutos, observacao) VALUES
-- Atendimento 1: Maria - Cardio
(1,  1, 1, TRUE,  12,  'Exame dentro do esperado, ritmo sinusial normal'),
-- Atendimento 2: Joao - Neuro
(2,  5, 2, TRUE,   8,  'Duas puncoes realizadas, segunda tentativa bem-sucedida'),
(2,  2, 1, TRUE,  25,  'Raio-X de controle pos-queda'),
-- Atendimento 3: Ana - Ortop
(3,  3, 1, FALSE, 45,  'Sutura de 5 pontos em antebraco esquerdo'),
-- Atendimento 4: Pedro - Cirurgia
(4,  4, 1, TRUE,  12,  'Intubacao de emergencia, via area dificil'),
(4,  6, 2, FALSE, 20,  'Curativo pos-operatorio, troca programada'),
-- Atendimento 5: Lucia - Cardio
(5,  1, 1, TRUE,  18,  'ECG solicitado para investigacao de arritmia'),
-- Atendimento 6: Maria - Clin
(6,  5, 1, FALSE,  4,  'Coleta de sangue para hemograma completo'),
(6,  6, 1, FALSE, 10,  'Curativo simples, lesao superficial'),
-- Atendimento 7: Carlos - Cardio
(7,  7, 1, TRUE,   8,  'Aspiracao de secrecao, paciente melhorou oxigenacao'),
-- Atendimento 8: Fernanda - Neuro
(8,  5, 1, TRUE,   5,  'Puncao venosa para exames laboratoriais'),
-- Atendimento 9: Joao - Ortop
(9,  2, 1, FALSE, 15,  'Raio-X de coluna lombar'),
-- Atendimento 10: Ana - Cirurg
(10, 3, 1, TRUE,  50,  'Sutura cirurgica de 12 pontos, procedimento prolongado');

-- 13. escala (8 registros)
INSERT INTO escala (id_escala, id_unidade, dia_semana, turno, id_residente, id_preceptor) VALUES
(1,  1, 'segunda',  'manha',  8,  14),   -- UTI:       Rafael + Fernando
(2,  1, 'quarta',   'noite', 13,  14),   -- UTI:       Isabela + Fernando
(3,  2, 'segunda',  'manha',  9,  15),   -- Emergencia: Camila + Patricia
(4,  2, 'terca',    'tarde', 10,  16),   -- Emergencia: Lucas + Eduardo
(5,  3, 'quinta',   'manha', 11,  17),   -- Pediatria:  Beatriz + Adriana
(6,  3, 'sexta',    'tarde',  9,  15),   -- Pediatria:  Camila + Patricia
(7,  4, 'segunda',  'manha', 12,  18),   -- Centro Cir: Thiago + Marcos
(8,  4, 'quarta',   'tarde', 10,  16);   -- Centro Cir: Lucas + Eduardo
