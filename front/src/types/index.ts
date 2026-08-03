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

export interface Unidade {
  id_unidade: number;
  nome: string;
  tipo: string;
  capacidade_leitos: number;
}

export interface Escala {
  id_escala: number;
  id_unidade: number;
  nome_unidade: string;
  dia_semana: string;
  turno: string;
  id_residente: number;
  nome_residente: string;
  id_preceptor: number;
  nome_preceptor: string;
}

export interface EscalaCreate {
  id_unidade: number;
  dia_semana: string;
  turno: string;
  id_residente: number;
  id_preceptor: number;
}

export interface TempoMedioEspera {
  id_unidade: number | null;
  unidade: string;
  total_atendimentos_analisados: number;
  tempo_medio_espera_minutos: number | null;
}

export interface EstatisticaMensal {
  ano: number;
  mes: number;
  nome_unidade: string;
  total_atendimentos: number;
  media_duracao_minutos: number | null;
  procedimento_mais_comum: string;
}

export interface PacienteInternado {
  id_paciente: number;
  nome_paciente: string;
  cpf: string;
  num_convenio?: string | null;
  unidade_internacao: string;
  data_entrada: string;
  motivo?: string | null;
}

export interface ResidenteSemSupervisor {
  id_escala: number;
  nome_unidade: string;
  dia_semana: string;
  turno: string;
  nome_residente: string;
  ano_residencia: number;
  nome_preceptor: string;
  titulacao_preceptor: string;
  motivo_alerta: string;
}

export interface ReajustarEscalaIn {
  id_residente: number;
  dia_origem: string;
  turno_origem: string;
  dia_destino: string;
  turno_destino: string;
}

export interface TempoMedioProcedimento {
  id_procedimento: number;
  codigo: string;
  nome: string;
  risco: string;
  tempo_medio_minutos: number | null;
  total_realizacoes: number;
}

export interface AuditoriaAtendimento {
  id_auditoria: number;
  id_atendimento: number | null;
  operacao: string;
  registrado_em: string;
  data_hora_antigo?: string | null;
  data_hora_novo?: string | null;
  duracao_minutos_antigo?: number | null;
  duracao_minutos_novo?: number | null;
  paciente_antigo?: string | null;
  paciente_novo?: string | null;
  residente_antigo?: string | null;
  residente_novo?: string | null;
  preceptor_antigo?: string | null;
  preceptor_novo?: string | null;
  unidade_antigo?: string | null;
  unidade_novo?: string | null;
}

export interface AuditoriaPage {
  items: AuditoriaAtendimento[];
  next_cursor: number | null;
  total: number;
}

export interface AuditoriaFiltro {
  dataInicial?: string;
  dataFinal?: string;
  cursor?: number;
  limite?: number;
}
