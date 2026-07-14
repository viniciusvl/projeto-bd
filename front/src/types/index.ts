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

export interface Atendimento {
  id_atendimento: number;
  data_hora: string;
  duracao_minutos: number;
  id_paciente: number;
  id_residente: number;
  id_preceptor: number;
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

export interface PlantaoUnidade {
  unidade: string;
  residente: string;
  quantidade_plantoes: number;
}

export interface PacienteSemRisco {
  paciente: string;
}
