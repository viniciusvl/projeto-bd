import type {
  Atendimento,
  AtendimentoCreate,
  Paciente,
  PacienteSemRisco,
  PacienteUpdate,
  PlantaoUnidade,
  PreceptorSupervisao,
  ProcedimentoRealizado,
  RankingResidente,
  TempoMedio,
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
  atualizarPaciente: (body: PacienteUpdate) =>
    request<{ id_pessoa: number; atualizado: boolean }>("/paciente", {
      method: "PATCH",
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
  preceptoresSupervisao: (ano: number, mes: number) =>
    request<PreceptorSupervisao[]>(
      `/relatorio/preceptores-supervisao/?ano=${ano}&mes=${mes}`
    ),
  plantoesPorUnidade: () =>
    request<PlantaoUnidade[]>("/relatorio/plantoes-por-unidade/"),
  pacientesSemRiscoAlto: () =>
    request<PacienteSemRisco[]>("/relatorio/pacientes-sem-risco-alto/"),
};
