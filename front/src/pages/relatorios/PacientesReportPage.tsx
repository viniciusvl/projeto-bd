import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import type { PacienteSemRisco } from "../../types";

export function PacientesReportPage() {
  const { data, loading, error } = useFetch<PacienteSemRisco[]>(() =>
    api.pacientesSemRiscoAlto()
  );
  const lista = useMemo(() => data ?? [], [data]);

  return (
    <AppLayout
      title="Relatório — Pacientes"
      subtitle="Pacientes sem procedimento de risco alto"
    >
      <Card
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Pacientes sem procedimento de risco alto"
        subtitle="Pacientes que nunca realizaram nenhum procedimento de nível de risco 'ALTO'"
      >
        {loading ? (
          <Spinner label="Carregando pacientes..." />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
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
