DROP DATABASE IF EXISTS hospital;
CREATE DATABASE hospital
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE hospital;

SET NAMES 'utf8mb4';

-- 1. Tabela Base: pessoa
CREATE TABLE pessoa (
    id_pessoa        INT           NOT NULL AUTO_INCREMENT,
    nome             VARCHAR(150)  NOT NULL,
    cpf              VARCHAR(14)   NOT NULL,
    data_nascimento  DATE          NOT NULL,
    is_flamengo      BOOLEAN       NOT NULL DEFAULT FALSE,
    telefone         VARCHAR(15),

    CONSTRAINT pk_pessoa PRIMARY KEY (id_pessoa),
    CONSTRAINT uq_pessoa_cpf UNIQUE (cpf)
);

-- 2. Tabela: paciente (especialização de pessoa)
CREATE TABLE paciente (
    id_pessoa          INT          NOT NULL,
    num_convenio       VARCHAR(30),
    grupo_sanguineo    ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    estado             VARCHAR(2),
    cidade             VARCHAR(100),
    bairro             VARCHAR(100),
    logradouro         VARCHAR(150),
    numero             VARCHAR(10),

    CONSTRAINT pk_paciente PRIMARY KEY (id_pessoa),
    CONSTRAINT fk_paciente_pessoa FOREIGN KEY (id_pessoa)
        REFERENCES pessoa (id_pessoa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 3. Tabela: alergia_paciente (multivalorado de paciente)
CREATE TABLE alergia_paciente (
    id_pessoa  INT          NOT NULL,
    alergia    VARCHAR(100) NOT NULL,

    CONSTRAINT pk_alergia_paciente PRIMARY KEY (id_pessoa, alergia),
    CONSTRAINT fk_alergia_paciente_pessoa FOREIGN KEY (id_pessoa)
        REFERENCES pessoa (id_pessoa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 4. Tabela: profissional (especialização de pessoa)
CREATE TABLE profissional (
    id_pessoa      INT         NOT NULL,
    crm            VARCHAR(13) NOT NULL,
    data_admissao  DATE        NOT NULL,

    CONSTRAINT pk_profissional PRIMARY KEY (id_pessoa),
    CONSTRAINT uq_profissional_crm UNIQUE (crm),
    CONSTRAINT fk_profissional_pessoa FOREIGN KEY (id_pessoa)
        REFERENCES pessoa (id_pessoa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 5. Tabela: preceptor (especialização de profissional)
CREATE TABLE preceptor (
    id_profissional  INT          NOT NULL,
    titulacao        VARCHAR(50)  NOT NULL,

    CONSTRAINT pk_preceptor PRIMARY KEY (id_profissional),
    CONSTRAINT fk_preceptor_profissional FOREIGN KEY (id_profissional)
        REFERENCES profissional (id_pessoa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 6. Tabela: residente (especialização de profissional)
CREATE TABLE residente (
    id_profissional  INT  NOT NULL,
    ano_residencia   INT  NOT NULL,

    CONSTRAINT pk_residente PRIMARY KEY (id_profissional),
    CONSTRAINT fk_residente_profissional FOREIGN KEY (id_profissional)
        REFERENCES profissional (id_pessoa)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 7. Tabela: especialidade
CREATE TABLE especialidade (
    id_especialidade  INT         NOT NULL AUTO_INCREMENT,
    nome              VARCHAR(80) NOT NULL,

    CONSTRAINT pk_especialidade PRIMARY KEY (id_especialidade),
    CONSTRAINT uq_especialidade_nome UNIQUE (nome)
);

-- 8. Tabela: profissional_especialidade (N:M)
CREATE TABLE profissional_especialidade (
    id_profissional   INT  NOT NULL,
    id_especialidade  INT  NOT NULL,

    CONSTRAINT pk_profissional_especialidade PRIMARY KEY (id_profissional, id_especialidade),
    CONSTRAINT fk_pe_profissional FOREIGN KEY (id_profissional)
        REFERENCES profissional (id_pessoa)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pe_especialidade FOREIGN KEY (id_especialidade)
        REFERENCES especialidade (id_especialidade)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 9. Tabela: procedimento
CREATE TABLE procedimento (
    id_procedimento       INT         NOT NULL AUTO_INCREMENT,
    codigo                VARCHAR(20) NOT NULL,
    nome                  VARCHAR(100) NOT NULL,
    tempo_medio_minutos   INT         NOT NULL,
    risco                 ENUM('baixo', 'medio', 'alto') NOT NULL,

    CONSTRAINT pk_procedimento PRIMARY KEY (id_procedimento),
    CONSTRAINT uq_procedimento_codigo UNIQUE (codigo),
    CONSTRAINT chk_procedimento_tempo CHECK (tempo_medio_minutos > 0)
);

-- 10. Tabela: unidade
CREATE TABLE unidade (
    id_unidade          INT          NOT NULL AUTO_INCREMENT,
    nome                VARCHAR(80)  NOT NULL,
    tipo                ENUM('UTI', 'Emergencia', 'Consultorio', 'Centro Cirurgico', 'Enfermaria') NOT NULL,
    capacidade_leitos   INT          NOT NULL,

    CONSTRAINT pk_unidade PRIMARY KEY (id_unidade),
    CONSTRAINT chk_unidade_leitos CHECK (capacidade_leitos >= 0)
);

-- 11. Tabela: atendimento
CREATE TABLE atendimento (
    id_atendimento   INT       NOT NULL AUTO_INCREMENT,
    data_hora        DATETIME  NOT NULL,
    duracao_minutos  INT       NOT NULL,
    id_paciente      INT       NOT NULL,
    id_residente     INT       NOT NULL,
    id_preceptor     INT       NOT NULL,

    CONSTRAINT pk_atendimento PRIMARY KEY (id_atendimento),
    CONSTRAINT chk_atendimento_duracao CHECK (duracao_minutos > 0),
    CONSTRAINT fk_atendimento_paciente FOREIGN KEY (id_paciente)
        REFERENCES paciente (id_pessoa)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_atendimento_residente FOREIGN KEY (id_residente)
        REFERENCES residente (id_profissional)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_atendimento_preceptor FOREIGN KEY (id_preceptor)
        REFERENCES preceptor (id_profissional)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- 12. Tabela: procedimento_realizado (N:M entre atendimento e procedimento)
CREATE TABLE procedimento_realizado (
    id_atendimento       INT  NOT NULL,
    id_procedimento      INT  NOT NULL,
    quantidade           INT  NOT NULL DEFAULT 1,
    faturado             BOOLEAN NOT NULL DEFAULT FALSE,
    tempo_real_minutos   INT,
    observacao           TEXT,

    CONSTRAINT pk_procedimento_realizado PRIMARY KEY (id_atendimento, id_procedimento),
    CONSTRAINT chk_pr_quantidade CHECK (quantidade > 0),
    CONSTRAINT fk_pr_atendimento FOREIGN KEY (id_atendimento)
        REFERENCES atendimento (id_atendimento)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pr_procedimento FOREIGN KEY (id_procedimento)
        REFERENCES procedimento (id_procedimento)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- 13. Tabela: escala
CREATE TABLE escala (
    id_escala       INT       NOT NULL AUTO_INCREMENT,
    id_unidade      INT       NOT NULL,
    dia_semana      ENUM('domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado') NOT NULL,
    turno           ENUM('manha', 'tarde', 'noite') NOT NULL,
    id_residente    INT       NOT NULL,
    id_preceptor    INT       NOT NULL,

    CONSTRAINT pk_escala PRIMARY KEY (id_escala),
    CONSTRAINT uq_escala_unidade_turno UNIQUE (id_unidade, dia_semana, turno),
    CONSTRAINT fk_escala_unidade FOREIGN KEY (id_unidade)
        REFERENCES unidade (id_unidade)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_escala_residente FOREIGN KEY (id_residente)
        REFERENCES residente (id_profissional)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_escala_preceptor FOREIGN KEY (id_preceptor)
        REFERENCES preceptor (id_profissional)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
