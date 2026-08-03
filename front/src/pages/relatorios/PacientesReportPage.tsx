import { useMemo } from "react";
import { BedDouble, ShieldCheck } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { formatDateTime } from "../../lib/format";
import { api } from "../../api/client";
import type { PacienteInternado, PacienteSemRisco } from "../../types";

export function PacientesReportPage() {
  const semRisco = useFetch<PacienteSemRisco[]>(() => api.pacientesSemRiscoAlto());
  const internados = useFetch<PacienteInternado[]>(() =>
    api.pacientesInternados()
  );

  const lista = useMemo(() => semRisco.data ?? [], [semRisco.data]);
  const listaInternados = useMemo(
    () => internados.data ?? [],
    [internados.data]
  );

  return (
    <AppLayout
      title="Relatório — Pacientes"
      subtitle="Internações ativas e pacientes sem procedimento de risco alto"
    >
      <Card
        icon={<BedDouble className="h-5 w-5" />}
        title="Pacientes internados"
        subtitle="Internações atualmente ativas (sem data de saída)"
        className="mb-6"
      >
        {internados.loading ? (
          <Spinner label="Carregando internações..." />
        ) : internados.error ? (
          <EmptyState title="Erro ao carregar" description={internados.error} />
        ) : listaInternados.length === 0 ? (
          <EmptyState
            title="Sem internações ativas"
            description="Nenhum paciente está internado no momento."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Paciente</th>
                  <th className="th">Unidade</th>
                  <th className="th">Entrada</th>
                  <th className="th">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {listaInternados.map((p) => (
                  <tr key={p.id_paciente} className="tr">
                    <td className="td">
                      <div className="font-semibold text-slate-800">
                        {p.nome_paciente}
                      </div>
                      {p.num_convenio && (
                        <div className="text-xs text-slate-400">
                          Convênio {p.num_convenio}
                        </div>
                      )}
                    </td>
                    <td className="td">
                      <Badge tone="brand">{p.unidade_internacao}</Badge>
                    </td>
                    <td className="td text-slate-500">
                      {formatDateTime(p.data_entrada)}
                    </td>
                    <td className="td text-slate-500">{p.motivo ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Pacientes sem procedimento de risco alto"
        subtitle="Pacientes que nunca realizaram nenhum procedimento de nível de risco 'ALTO'"
      >
        {semRisco.loading ? (
          <Spinner label="Carregando pacientes..." />
        ) : semRisco.error ? (
          <EmptyState title="Erro ao carregar" description={semRisco.error} />
        ) : lista.length === 0 ? (
          <EmptyState
            title="Nenhum paciente"
            description="Todos os pacientes realizaram ao menos um procedimento de risco alto."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {lista.map((p, i) => (
              <li
                key={`${p.paciente}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="font-medium text-slate-700">{p.paciente}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppLayout>
  );
}
