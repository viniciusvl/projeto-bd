import { Timer, Trophy } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import type { RankingResidente, TempoMedio } from "../../types";

export function ResidentesPage() {
  const tempo = useFetch<TempoMedio[]>(() => api.tempoMedio());
  const ranking = useFetch<RankingResidente[]>(() => api.rankingResidentes());

  const tempos = tempo.data ?? [];
  const ranks = ranking.data ?? [];
  const maxTempo = Math.max(1, ...tempos.map((t) => t.tempo_medio_minutos ?? 0));

  return (
    <AppLayout
      title="Relatório — Residentes"
      subtitle="Desempenho dos residentes por atendimento"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          icon={<Timer className="h-5 w-5" />}
          title="Tempo médio de atendimento"
          subtitle="Média de duração (minutos) por residente"
        >
          {tempo.loading ? (
            <Spinner />
          ) : tempo.error ? (
            <EmptyState title="Erro ao carregar" description={tempo.error} />
          ) : tempos.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <ul className="space-y-3">
              {tempos.map((t) => (
                <li key={t.id_residente}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{t.nome_residente}</span>
                    <span className="font-bold text-brand-700">
                      {t.tempo_medio_minutos != null
                        ? `${t.tempo_medio_minutos} min`
                        : "—"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${((t.tempo_medio_minutos ?? 0) / maxTempo) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          icon={<Trophy className="h-5 w-5" />}
          title="Ranking por atendimentos"
          subtitle="Total de atendimentos realizados por residente"
        >
          {ranking.loading ? (
            <Spinner />
          ) : ranking.error ? (
            <EmptyState title="Erro ao carregar" description={ranking.error} />
          ) : ranks.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <ol className="space-y-2">
              {ranks.map((r, i) => (
                <li
                  key={`${r.nome}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? "bg-amber-100 text-amber-700"
                        : i === 1
                          ? "bg-slate-200 text-slate-600"
                          : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-slate-700">{r.nome}</span>
                  <span className="text-sm font-bold text-slate-800">{r.total}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
