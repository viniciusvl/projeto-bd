import { useMemo } from "react";
import { Timer } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import type { TempoMedioProcedimento } from "../../types";

type Tone = "success" | "warning" | "neutral" | "brand" | "danger";

function riscoTone(risco: string): Tone {
  const r = risco.toLowerCase();
  if (r.includes("alto")) return "danger";
  if (r.includes("med")) return "warning";
  if (r.includes("baix")) return "success";
  return "neutral";
}

export function ProcedimentosPage() {
  const { data, loading, error } = useFetch<TempoMedioProcedimento[]>(() =>
    api.tempoMedioProcedimentos()
  );
  const lista = useMemo(() => data ?? [], [data]);

  const maxTempo = Math.max(
    1,
    ...lista.map((p) => p.tempo_medio_minutos ?? 0)
  );

  return (
    <AppLayout
      title="Relatório — Procedimentos"
      subtitle="Tempo médio de execução de cada procedimento"
    >
      <Card
        icon={<Timer className="h-5 w-5" />}
        title="Tempo médio por procedimento"
        subtitle="Média de duração (minutos) calculada a partir das execuções registradas"
      >
        {loading ? (
          <Spinner label="Carregando procedimentos..." />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : lista.length === 0 ? (
          <EmptyState title="Sem dados" />
        ) : (
          <ul className="space-y-4">
            {lista.map((p) => (
              <li key={p.id_procedimento}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    {p.nome}
                    <Badge tone={riscoTone(p.risco)}>Risco {p.risco}</Badge>
                  </span>
                  <span className="font-bold text-brand-700">
                    {p.tempo_medio_minutos != null
                      ? `${p.tempo_medio_minutos} min`
                      : "—"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{
                      width: `${((p.tempo_medio_minutos ?? 0) / maxTempo) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {p.codigo} · {p.total_realizacoes} execução(ões) registrada(s)
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppLayout>
  );
}
