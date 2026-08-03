USE hospital;

SET NAMES 'utf8mb4';

-- Observação: os INSERTs usam INSERT IGNORE para que este script seja
-- idempotente. Ele é aplicado tanto na primeira inicialização do banco
-- (docker-entrypoint-initdb.d) quanto a cada deploy pelo pipeline CI/CD,
-- então rodar novamente apenas insere linhas novas e ignora as já existentes.

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
(12, '2026-07-08 22:15:00', 15,  5, 11,  17),   -- Lucia  + Beatriz + Adriana (Clin)
(13, '2026-05-02 09:00:00', 30,  1,  8,  14),   -- Maria + Vinícius Índio + Fernando (Cardio)
(14, '2026-05-05 10:30:00', 45,  2,  8,  14),   -- Pedro + Vinícius Índio + Fernando (Cardio)
(15, '2026-05-12 14:00:00', 40,  3,  8,  14),   -- Ana + Vinícius Índio + Fernando (Cardio)
(16, '2026-05-15 16:15:00', 35,  4,  8,  14),   -- Evandro + Vinícius Índio + Fernando (Cardio)
(17, '2026-05-20 08:30:00', 50,  5,  8,  14),   -- Lucia + Vinícius Índio + Fernando (Cardio)
(18, '2026-05-25 11:00:00', 60,  6,  8,  14),   -- Carlos + Vinícius Índio + Fernando (Cardio)
(19, '2026-05-26 15:00:00', 40,  7, 10,  16),   -- Fernanda + Vinícius Mandacaru + Eduardo (Ortop)
(20, '2026-06-02 09:00:00', 30,  1, 10,  16),   -- Maria + Vinícius Mandacaru + Eduardo (Ortop)
(21, '2026-06-03 10:00:00', 45,  2, 10,  16),   -- Pedro + Vinícius Mandacaru + Eduardo (Ortop)
(22, '2026-06-04 11:00:00', 50,  3, 10,  16),   -- Ana + Vinícius Mandacaru + Eduardo (Ortop)
(23, '2026-05-28 14:30:00', 30,  4,  9,  15),   -- Evandro + Camila + Patricia (Neuro)
(24, '2026-05-29 16:00:00', 25,  5,  9,  15);   -- Lucia + Camila + Patricia (Neuro)

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
(10, 3, 1, TRUE,  50,  'Sutura cirurgica de 12 pontos, procedimento prolongado'),
-- Atendimento 13: Maria - Cardio
(13, 1, 1, FALSE, 15,  'Eletrocardiograma de rotina no plantão'),
-- Atendimento 14: Pedro - Cardio
(14, 5, 1, TRUE,   5,  'Acesso venoso rápido'),
-- Atendimento 15: Ana - Cardio
(15, 6, 1, FALSE, 10,  'Curativo pós-operatório simples'),
-- Atendimento 16: Evandro - Cardio
(16, 2, 1, TRUE,  20,  'Raio-x de tórax solicitado pelo preceptor'),
-- Atendimento 17: Lucia - Cardio
(17, 1, 1, FALSE, 15,  'ECG de urgência'),
-- Atendimento 18: Carlos - Cardio
(18, 3, 1, TRUE,  30,  'Sutura simples'),
-- Atendimento 19: Fernanda - Ortop
(19, 5, 2, FALSE,  8,  'Punções difíceis'),
-- Atendimento 20: Maria - Ortop
(20, 2, 1, TRUE,  20,  'RX de controle'),
-- Atendimento 21: Pedro - Ortop
(21, 6, 1, FALSE, 12,  'Troca de curativo'),
-- Atendimento 22: Ana - Ortop
(22, 1, 1, TRUE,  15,  'ECG padrão de entrada');

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

-- ============================================================================
-- 14. Carga adicional: +10 pacientes (pessoa/paciente 20-29) e novos
--     atendimentos com residentes e preceptores variados.
-- ============================================================================

-- 14.1 pessoa (10 novos pacientes: 20-29)
INSERT INTO pessoa (id_pessoa, nome, cpf, data_nascimento, is_flamengo, telefone) VALUES
(20, 'Roberto Alves',      '100.200.300-40', '1969-04-12', FALSE, '(83) 99120-0020'),
(21, 'Juliana Castro',     '101.201.301-41', '1990-08-03', TRUE,  '(81) 99121-0021'),
(22, 'Marcelo Tavares',    '102.202.302-42', '1975-12-19', FALSE, '(71) 99122-0022'),
(23, 'Patricia Gomes',     '103.203.303-43', '1988-06-27', FALSE, '(21) 99123-0023'),
(24, 'Rafael Moreira',     '104.204.304-44', '2001-02-15', TRUE,  '(11) 99124-0024'),
(25, 'Beatriz Cardoso',    '105.205.305-45', '1996-10-08', FALSE, '(85) 99125-0025'),
(26, 'Gustavo Ramos',      '106.206.306-46', '1983-03-30', TRUE,  '(31) 99126-0026'),
(27, 'Larissa Fonseca',    '107.207.307-47', '1999-07-21', FALSE, '(41) 99127-0027'),
(28, 'Anderson Pinto',     '108.208.308-48', '1972-11-02', FALSE, '(51) 99128-0028'),
(29, 'Camila Duarte',      '109.209.309-49', '1993-05-17', TRUE,  '(62) 99129-0029');

-- 14.2 paciente (10 registros)
INSERT INTO paciente (id_pessoa, num_convenio, grupo_sanguineo, estado, cidade, bairro, logradouro, numero) VALUES
(20, 'CONV-8001', 'A+',  'PB', 'Campina Grande', 'Catole',      'Rua das Acacias',    '150'),
(21, 'CONV-8002', 'O+',  'PE', 'Recife',         'Boa Viagem',   'Av. Conselheiro',    '2200'),
(22, 'CONV-8003', 'B-',  'BA', 'Salvador',       'Pituba',       'Rua Amazonas',       '87'),
(23, 'CONV-8004', 'AB+', 'RJ', 'Niteroi',        'Icarai',       'Rua Gavioes',        '410'),
(24, 'CONV-8005', 'O-',  'SP', 'Campinas',       'Cambui',       'Rua Coronel Quirino','980'),
(25, 'CONV-8006', 'A-',  'CE', 'Fortaleza',      'Aldeota',      'Av. Santos Dumont',  '1330'),
(26, 'CONV-8007', 'B+',  'MG', 'Belo Horizonte', 'Savassi',      'Rua Pernambuco',     '75'),
(27, 'CONV-8008', 'AB-', 'PR', 'Curitiba',       'Batel',        'Av. do Batel',       '1600'),
(28, 'CONV-8009', 'O+',  'RS', 'Porto Alegre',   'Moinhos',      'Rua Padre Chagas',   '220'),
(29, 'CONV-8010', 'A+',  'GO', 'Goiania',        'Setor Bueno',  'Av. T-9',            '540');

-- 14.3 alergia_paciente (algumas alergias nos novos pacientes)
INSERT INTO alergia_paciente (id_pessoa, alergia) VALUES
(21, 'Penicilina'),
(24, 'Sulfa'),
(26, 'Dipirona'),
(29, 'Latex');

-- 14.4 atendimento (14 novos registros: 25-38) — cada paciente com residentes
--      e preceptores variados; alguns pacientes com mais de um atendimento.
INSERT INTO atendimento (id_atendimento, data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor) VALUES
(25, '2026-07-02 09:00:00', 40, 20,  9, 15),   -- Roberto  + Camila   + Patricia
(26, '2026-07-03 10:30:00', 30, 21, 11, 17),   -- Juliana  + Beatriz  + Adriana
(27, '2026-07-04 14:00:00', 55, 22, 12, 18),   -- Marcelo  + Thiago   + Marcos
(28, '2026-07-05 08:15:00', 25, 23, 13, 19),   -- Patricia + Isabela  + Sandra
(29, '2026-07-06 11:00:00', 60, 24, 10, 16),   -- Rafael   + Lucas    + Eduardo
(30, '2026-07-07 15:30:00', 35, 25,  8, 14),   -- Beatriz  + Vinicius Indio + Fernando
(31, '2026-07-08 09:45:00', 45, 26,  9, 16),   -- Gustavo  + Camila   + Eduardo
(32, '2026-07-09 13:00:00', 50, 27, 11, 15),   -- Larissa  + Beatriz  + Patricia
(33, '2026-07-10 16:00:00', 20, 28, 12, 19),   -- Anderson + Thiago   + Sandra
(34, '2026-07-11 08:00:00', 40, 29, 13, 17),   -- Camila D + Isabela  + Adriana
(35, '2026-07-14 10:00:00', 30, 20, 10, 16),   -- Roberto  + Lucas    + Eduardo   (2o atend.)
(36, '2026-07-15 09:30:00', 45, 22,  8, 14),   -- Marcelo  + Vinicius Indio + Fernando (2o atend.)
(37, '2026-07-16 14:30:00', 55, 25, 13, 18),   -- Beatriz  + Isabela  + Marcos    (2o atend.)
(38, '2026-07-17 11:15:00', 35, 27, 12, 19);   -- Larissa  + Thiago   + Sandra    (2o atend.)

-- 14.5 procedimento_realizado (procedimentos dos novos atendimentos)
INSERT INTO procedimento_realizado (id_atendimento, id_procedimento, quantidade, faturado, tempo_real_minutos, observacao) VALUES
(25, 1, 1, TRUE,  14, 'Eletrocardiograma de rotina'),
(25, 5, 1, FALSE,  6, 'Puncao venosa para coleta'),
(26, 6, 1, TRUE,  12, 'Curativo simples'),
(27, 3, 1, FALSE, 40, 'Sutura de ferimento em membro superior'),
(28, 2, 1, TRUE,  18, 'Raio-X de torax'),
(29, 4, 1, TRUE,  11, 'Intubacao orotraqueal de emergencia'),
(30, 5, 2, FALSE,  7, 'Duas puncoes venosas'),
(31, 1, 1, TRUE,  13, 'ECG de controle'),
(32, 6, 1, FALSE, 10, 'Troca de curativo'),
(33, 7, 1, TRUE,   9, 'Aspiracao de vias aereas'),
(34, 2, 1, FALSE, 20, 'Raio-X de coluna'),
(35, 3, 1, TRUE,  35, 'Sutura cirurgica'),
(36, 1, 1, FALSE, 15, 'Eletrocardiograma no plantao'),
(37, 6, 1, TRUE,  12, 'Curativo pos-operatorio'),
(38, 5, 1, FALSE,  5, 'Acesso venoso rapido');

-- 14.6 Procedimentos adicionais para enriquecer os atendimentos existentes
INSERT INTO procedimento_realizado (id_atendimento, id_procedimento, quantidade, faturado, tempo_real_minutos, observacao) VALUES
-- Atendimentos originais com procedimentos adicionais
(1,  5, 1, FALSE,  8,  'Puncao para coleta de sangue adicional'),
(3,  6, 1, FALSE, 10,  'Curativo apos sutura'),
(5,  2, 1, FALSE, 18,  'Raio-X para monitoramento cardiaco'),
(7,  6, 1, FALSE,  8,  'Curativo do local de aspiracao'),
(8,  2, 1, FALSE, 20,  'Raio-X para descartar pneumonia'),
(9,  3, 1, TRUE,  20,  'Sutura de ferimento adicional'),
(10, 6, 1, FALSE, 15,  'Curativo pos-cirurgico'),
(11, 1, 1, TRUE,  14,  'ECG no acompanhamento'),
(12, 6, 1, FALSE,  8,  'Curativo de manutencao'),
(13, 5, 1, FALSE,  6,  'Puncao para exames laboratoriais'),
(14, 1, 1, FALSE, 12,  'ECG de controle'),
(15, 2, 1, FALSE, 22,  'Raio-X de acompanhamento'),
(16, 1, 1, FALSE, 15,  'ECG adicional'),
(17, 2, 1, TRUE,  25,  'Raio-X de verificacao'),
(18, 5, 1, FALSE,  7,  'Puncao para coleta'),
(19, 3, 1, FALSE, 30,  'Sutura de ferimento'),
(20, 6, 1, FALSE, 10,  'Curativo de manutencao'),
(21, 2, 1, TRUE,  18,  'Raio-X de controle'),
(22, 6, 1, FALSE,  12, 'Curativo pos-exame'),
(23, 5, 1, TRUE,   7,  'Puncao venosa'),
(24, 1, 1, FALSE, 13, 'ECG de monitoramento'),
-- Novos atendimentos (25-38) com procedimentos complementares
(25, 6, 1, FALSE, 10,  'Curativo apos coleta'),
(26, 2, 1, TRUE,  15,  'Raio-X de torax'),
(27, 1, 1, FALSE, 15,  'Eletrocardiograma pre-operatorio'),
(27, 5, 1, FALSE,  6,  'Puncao para anestesia'),
(28, 6, 1, FALSE, 10,  'Curativo apos raio-X'),
(29, 6, 1, FALSE, 12,  'Curativo pos-intubacao'),
(29, 5, 1, FALSE,  8,  'Puncao para medicacao'),
(30, 6, 1, FALSE, 10,  'Curativo das multiplas puncoes'),
(31, 5, 1, FALSE,  7,  'Puncao venosa para coleta'),
(32, 1, 1, FALSE, 14,  'ECG de acompanhamento'),
(32, 5, 1, FALSE,  5,  'Puncao para medicacao'),
(33, 6, 1, FALSE,  8,  'Curativo apos aspiracao'),
(34, 6, 1, FALSE, 10,  'Curativo apos raio-X'),
(35, 6, 1, FALSE, 10,  'Curativo pos-sutura'),
(36, 5, 1, FALSE,  6,  'Puncao para coleta'),
(37, 1, 1, FALSE, 15,  'ECG de acompanhamento'),
(37, 5, 1, FALSE,  7,  'Puncao para medicacao'),
(38, 6, 1, FALSE, 10,  'Curativo apos puncao');

-- ============================================================================
-- 15. Dados da Etapa 2 — internações e preenchimento das colunas novas.
--     Idempotente: INSERT IGNORE e UPDATE ... WHERE coluna IS NULL.
-- ============================================================================

-- 15.1 internacao (internações em aberto = data_saida NULL; e algumas fechadas)
INSERT IGNORE INTO internacao
    (id_internacao, id_paciente, id_unidade, data_entrada, data_saida, motivo) VALUES
(1,  1, 1, '2026-07-01 08:00:00', NULL,                  'Observação cardiológica pós-arritmia'),
(2,  4, 4, '2026-06-20 10:00:00', '2026-06-25 09:00:00', 'Pós-operatório de cirurgia geral'),
(3, 20, 2, '2026-07-10 14:00:00', NULL,                  'Quadro respiratório em investigação'),
(4, 24, 1, '2026-07-12 22:30:00', NULL,                  'Insuficiência respiratória aguda'),
(5,  5, 3, '2026-06-28 09:15:00', '2026-07-02 11:00:00', 'Acompanhamento pediátrico'),
(6, 21, 2, '2026-07-15 07:45:00', NULL,                  'Dor torácica a esclarecer');

-- 15.2 atendimento.id_unidade — deriva da escala do residente; padrão = Pronto Socorro (2)
UPDATE atendimento a
JOIN (
    SELECT id_residente, MIN(id_unidade) AS id_unidade
    FROM escala
    GROUP BY id_residente
) e ON e.id_residente = a.id_residente
SET a.id_unidade = e.id_unidade
WHERE a.id_unidade IS NULL;

UPDATE atendimento SET id_unidade = 2 WHERE id_unidade IS NULL;

-- 15.3 procedimento_realizado.data_hora_inicio — inicia o 1º procedimento alguns
--      minutos após o atendimento (espera de 5 a 30 min, variando por atendimento),
--      para que o tempo médio de espera por unidade não fique zerado.
UPDATE procedimento_realizado pr
JOIN atendimento a ON a.id_atendimento = pr.id_atendimento
SET pr.data_hora_inicio = a.data_hora + INTERVAL (5 + (a.id_atendimento MOD 6) * 5) MINUTE
WHERE pr.data_hora_inicio IS NULL;

-- 15.4 procedimento.media_tempo_procedimento — média realizada inicial
UPDATE procedimento p
JOIN (
    SELECT id_procedimento, ROUND(AVG(tempo_real_minutos), 2) AS media
    FROM procedimento_realizado
    WHERE tempo_real_minutos IS NOT NULL
    GROUP BY id_procedimento
) m ON m.id_procedimento = p.id_procedimento
SET p.media_tempo_procedimento = m.media
WHERE p.media_tempo_procedimento IS NULL;

-- ============================================================================
-- 16. Atendimentos de AGOSTO/2026 (ids 39-48) — distribuídos nas 4 unidades
--     para popular as estatísticas mensais do mês corrente. id_unidade e
--     data_hora_inicio são definidos aqui (as UPDATEs das seções 15.2/15.3
--     já rodaram acima), gerando também tempos de espera realistas (> 0).
-- ============================================================================

-- 16.1 atendimento (10 novos: 39-48)
INSERT IGNORE INTO atendimento
    (id_atendimento, data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor, id_unidade) VALUES
(39, '2026-08-03 08:30:00', 45,  1,  8, 14, 1),   -- UTI Adulto:            Maria    + Rafael  + Fernando
(40, '2026-08-05 14:00:00', 30, 20, 13, 14, 1),   -- UTI Adulto:            Roberto  + Isabela + Fernando
(41, '2026-08-04 09:15:00', 50,  2,  9, 15, 2),   -- Pronto Socorro:        Pedro    + Camila  + Patricia
(42, '2026-08-06 10:30:00', 25, 21, 10, 16, 2),   -- Pronto Socorro:        Juliana  + Lucas   + Eduardo
(43, '2026-08-10 16:45:00', 40,  6, 11, 17, 2),   -- Pronto Socorro:        Carlos   + Beatriz + Adriana
(44, '2026-08-07 11:00:00', 35,  7,  9, 15, 3),   -- Ambulatorio Pediatria: Fernanda + Camila  + Patricia
(45, '2026-08-12 13:30:00', 20,  3, 11, 17, 3),   -- Ambulatorio Pediatria: Ana      + Beatriz + Adriana
(46, '2026-08-11 07:30:00', 90,  4, 12, 18, 4),   -- Bloco Cirurgico:       Evandro  + Thiago  + Marcos
(47, '2026-08-14 15:00:00', 60, 22, 12, 18, 4),   -- Bloco Cirurgico:       Marcelo  + Thiago  + Marcos
(48, '2026-08-18 09:00:00', 75, 24, 10, 16, 4);   -- Bloco Cirurgico:       Rafael M + Lucas   + Eduardo

-- 16.2 procedimento_realizado dos atendimentos de agosto (com data_hora_inicio
--      alguns minutos após o atendimento, gerando tempo de espera > 0)
INSERT IGNORE INTO procedimento_realizado
    (id_atendimento, id_procedimento, quantidade, faturado, tempo_real_minutos, data_hora_inicio, observacao) VALUES
(39, 1, 1, TRUE,  14, '2026-08-03 08:45:00', 'Eletrocardiograma de rotina na UTI'),
(40, 5, 1, FALSE,  6, '2026-08-05 14:10:00', 'Puncao venosa para coleta'),
(41, 3, 1, TRUE,  40, '2026-08-04 09:30:00', 'Sutura de ferimento em membro superior'),
(41, 6, 1, FALSE, 12, '2026-08-04 09:35:00', 'Curativo apos sutura'),
(42, 5, 1, FALSE,  7, '2026-08-06 10:40:00', 'Puncao venosa para medicacao'),
(43, 2, 1, TRUE,  20, '2026-08-10 17:00:00', 'Raio-X de torax'),
(44, 6, 1, FALSE, 11, '2026-08-07 11:12:00', 'Curativo simples pediatrico'),
(45, 6, 1, FALSE,  9, '2026-08-12 13:40:00', 'Troca de curativo'),
(46, 4, 1, TRUE,  12, '2026-08-11 07:50:00', 'Intubacao orotraqueal pre-cirurgica'),
(46, 6, 2, FALSE, 18, '2026-08-11 08:10:00', 'Curativo pos-operatorio'),
(47, 3, 1, TRUE,  45, '2026-08-14 15:20:00', 'Sutura cirurgica prolongada'),
(48, 3, 1, TRUE,  50, '2026-08-18 09:25:00', 'Sutura de ferimento cirurgico'),
(48, 5, 1, FALSE,  6, '2026-08-18 09:30:00', 'Acesso venoso para anestesia');

-- ============================================================================
-- 17. Movimentações extras para gerar histórico de AUDITORIA com variedade de
--     operações (Alteração e Exclusão), além das Criações. Usa atendimentos
--     temporários (49, 50) para NÃO afetar as estatísticas/relatórios.
--     Os triggers trg_audita_atendimento_* registram cada operação.
-- ============================================================================

-- 17.1 Criação dos atendimentos temporários (gera 'Criação' na auditoria)
INSERT IGNORE INTO atendimento
    (id_atendimento, data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor, id_unidade) VALUES
(49, '2026-08-20 10:00:00', 30,  5,  9, 15, 2),   -- Lucia    + Camila + Patricia (Pronto Socorro)
(50, '2026-08-21 14:00:00', 40, 26, 10, 16, 4);   -- Gustavo  + Lucas  + Eduardo  (Bloco Cirurgico)

-- 17.2 Alterações (gera 'Alteração' na auditoria, com diffs de campos)
UPDATE atendimento SET duracao_minutos = 55 WHERE id_atendimento = 49;
UPDATE atendimento
   SET data_hora = '2026-08-22 08:30:00', duracao_minutos = 25, id_unidade = 1
 WHERE id_atendimento = 50;

-- 17.3 Exclusões (gera 'Exclusão' na auditoria, com os valores antigos)
DELETE FROM atendimento WHERE id_atendimento IN (49, 50);
