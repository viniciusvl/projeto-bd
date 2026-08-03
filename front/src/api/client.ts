import type {
  Atendimento,
  AtendimentoCreate,
  AuditoriaFiltro,
  AuditoriaPage,
  Escala,
  EscalaCreate,
  EstatisticaMensal,
  Paciente,
  PacienteCreate,
  PacienteInternado,
  PacienteSemRisco,
  PacienteUpdate,
  PlantaoUnidade,
  PreceptorSupervisao,
  ProcedimentoRealizado,
  Profissional,
  RankingPreceptor,
  RankingResidente,
  ReajustarEscalaIn,
  ResidenteSemSupervisor,
  TempoMedio,
  TempoMedioEspera,
  TempoMedioProcedimento,
  Unidade,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique se o backend está em execução."
    );
  }

  if (!res.ok) {
    let detail = `Erro ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // Pacientes
  listarPacientes: () => request<Paciente[]>("/paciente/"),
  criarPaciente: (body: PacienteCreate) =>
    request<Paciente>("/paciente", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  atualizarPaciente: (body: PacienteUpdate) =>
    request<{ id_pessoa: number; atualizado: boolean }>("/paciente", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Profissionais
  listarResidentes: () => request<Profissional[]>("/profissional/residentes/"),
  listarPreceptores: () => request<Profissional[]>("/profissional/preceptores/"),

  // Unidades
  listarUnidades: () => request<Unidade[]>("/unidade/"),

  // Escalas
  listarEscalas: () => request<Escala[]>("/escala/"),
  criarEscala: (body: EscalaCreate) =>
    request<Escala>("/escala", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  reajustarEscala: (body: ReajustarEscalaIn) =>
    request<{ message: string }>("/escala/reajustar", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // Atendimentos
  listarAtendimentos: (idPaciente: number) =>
    request<Atendimento[]>(`/atendimento/?id_paciente=${idPaciente}`),
  criarAtendimento: (body: AtendimentoCreate) =>
    request<Atendimento>("/atendimento", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Procedimentos
  listarProcedimentos: (idAtendimento: number) =>
    request<ProcedimentoRealizado[]>(
      `/procedimento/?id_atendimento=${idAtendimento}`
    ),
  removerProcedimento: (idProcedimento: number, idAtendimento: number) =>
    request<void>(
      `/procedimento/${idProcedimento}?id_atendimento=${idAtendimento}`,
      { method: "DELETE" }
    ),

  // Relatórios
  tempoMedio: () => request<TempoMedio[]>("/atendimento/tempo-medio/"),
  rankingResidentes: () =>
    request<RankingResidente[]>("/relatorio/ranking-residentes/"),
  rankingPreceptores: () =>
    request<RankingPreceptor[]>("/relatorio/ranking-preceptores/"),
  preceptoresSupervisao: (ano: number, mes: number) =>
    request<PreceptorSupervisao[]>(
      `/relatorio/preceptores-supervisao/?ano=${ano}&mes=${mes}`
    ),
  plantoesPorUnidade: () =>
    request<PlantaoUnidade[]>("/relatorio/plantoes-por-unidade/"),
  pacientesSemRiscoAlto: () =>
    request<PacienteSemRisco[]>("/relatorio/pacientes-sem-risco-alto/"),
  tempoMedioEspera: () =>
    request<TempoMedioEspera[]>("/atendimento/tempo-medio-espera/"),
  estatisticasMensais: (ano?: number, mes?: number) => {
    const params = new URLSearchParams();
    if (ano != null) params.set("ano", String(ano));
    if (mes != null) params.set("mes", String(mes));
    const qs = params.toString();
    return request<EstatisticaMensal[]>(
      `/relatorio/estatisticas-mensais/${qs ? `?${qs}` : ""}`
    );
  },
  pacientesInternados: () =>
    request<PacienteInternado[]>("/relatorio/pacientes-internados/"),
  residentesSemSupervisor: () =>
    request<ResidenteSemSupervisor[]>("/relatorio/residentes-sem-supervisor/"),
  tempoMedioProcedimentos: () =>
    request<TempoMedioProcedimento[]>("/relatorio/tempo-medio-procedimentos/"),
  auditoriaAtendimentos: (filtro: AuditoriaFiltro = {}) => {
    const params = new URLSearchParams();
    if (filtro.dataInicial) params.set("data_inicial", filtro.dataInicial);
    if (filtro.dataFinal) params.set("data_final", filtro.dataFinal);
    if (filtro.cursor != null) params.set("cursor", String(filtro.cursor));
    if (filtro.limite != null) params.set("limite", String(filtro.limite));
    const qs = params.toString();
    return request<AuditoriaPage>(
      `/relatorio/auditoria-atendimentos/${qs ? `?${qs}` : ""}`
    );
  },
};
