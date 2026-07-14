import { useMemo } from "react";
import { Building2, CalendarClock, Info } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import type { PlantaoUnidade } from "../../types";

export function PlantoesPage() {
  const { data, loading, error } = useFetch<PlantaoUnidade[]>(() =>
    api.plantoesPorUnidade()
  );
  const lista = useMemo(() => data ?? [], [data]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, PlantaoUnidade[]>();
    for (const item of lista) {
      const atual = mapa.get(item.unidade) ?? [];
      atual.push(item);
      mapa.set(item.unidade, atual);
    }
    return Array.from(mapa.entries());
  }, [lista]);

  return (
    <AppLayout
      title="Relatório — Plantões"
      subtitle="Quantidade de plantões escalados por residente, para cada unidade"
    >
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          A escala é definida por <strong>dia da semana e turno</strong> (não possui data),
          portanto o total considera todos os plantões escalados por residente em cada
          unidade.
        </p>
      </div>

      {loading ? (
        <Card>
          <Spinner label="Carregando plantões..." />
        </Card>
      ) : error ? (
        <Card>
          <EmptyState title="Erro ao carregar" description={error} />
        </Card>
      ) : grupos.length === 0 ? (
        <Card>
          <EmptyState title="Nenhum plantão escalado" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {grupos.map(([unidade, itens]) => (
            <Card
              key={unidade}
              icon={<Building2 className="h-5 w-5" />}
              title={unidade}
              subtitle={`${itens.length} residente(s) escalado(s)`}
            >
              <ul className="space-y-2">
                {itens.map((item, i) => (
                  <li
                    key={`${item.residente}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <CalendarClock className="h-4 w-4 text-brand-500" />
                      {item.residente}
                    </span>
                    <Badge tone="brand">{item.quantidade_plantoes} plantão(ões)</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
