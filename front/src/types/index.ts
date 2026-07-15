export interface Paciente {
  id_pessoa: number;
  nome: string;
  telefone?: string | null;
  num_convenio?: string | null;
  grupo_sanguineo?: string | null;
  estado?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
}

export interface PacienteUpdate {
  id_pessoa: number;
  num_convenio?: string | null;
  estado?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
}

export interface PacienteCreate {
  nome: string;
  cpf: string;
  data_nascimento: string;
  is_flamengo: boolean;
  telefone?: string | null;
  num_convenio?: string | null;
  grupo_sanguineo?: string | null;
  estado?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  logradouro?: string | null;
  numero?: string | null;
}

export interface Profissional {
  id_profissional: number;
  nome: string;
}

export interface Atendimento {
  id_atendimento: number;
  data_hora: string;
  duracao_minutos: number;
  id_paciente: number;
  id_residente: number;
  id_preceptor: number;
  nome_residente?: string | null;
  nome_preceptor?: string | null;
}

export interface AtendimentoCreate {
  data_hora: string;
  duracao_minutos: number;
  id_paciente: number;
  id_residente: number;
  id_preceptor: number;
}

export interface ProcedimentoRealizado {
  id_procedimento: number;
  nome_procedimento: string;
  quantidade: number;
  tempo_real?: number | null;
  faturado: boolean;
}

export interface TempoMedio {
  id_residente: number;
  nome_residente: string;
  tempo_medio_minutos: number | null;
}

export interface RankingResidente {
  nome: string;
  total: number;
}

export interface PreceptorSupervisao {
  nome_preceptor: string;
  total_supervisoes: number;
}

export interface RankingPreceptor {
  nome: string;
  total: number;
}

export interface PlantaoUnidade {
  unidade: string;
  residente: string;
  quantidade_plantoes: number;
}

export interface PacienteSemRisco {
  paciente: string;
}
