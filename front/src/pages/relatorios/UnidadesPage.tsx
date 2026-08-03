import { useMemo, useState } from "react";
import { Building2, CalendarClock, CalendarRange, Info, Timer } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import { MESES } from "../../lib/format";
import type {
  EstatisticaMensal,
  PlantaoUnidade,
  TempoMedioEspera,
} from "../../types";

const anoBase = new Date().getFullYear();
const anos = Array.from(
  new Set([anoBase, anoBase - 1, 2026, 2025, 2024])
).sort((a, b) => b - a);

export function UnidadesPage() {
  // Estatísticas mensais: por padrão o mês atual; o usuário pode escolher outro.
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const mensal = useFetch<EstatisticaMensal[]>(
    () => api.estatisticasMensais(ano, mes),
    [ano, mes]
  );
  const espera = useFetch<TempoMedioEspera[]>(() => api.tempoMedioEspera());
  const plantoes = useFetch<PlantaoUnidade[]>(() => api.plantoesPorUnidade());

  const mensais = useMemo(() => mensal.data ?? [], [mensal.data]);
  const esperas = useMemo(() => espera.data ?? [], [espera.data]);
  const lista = useMemo(() => plantoes.data ?? [], [plantoes.data]);

  const maxEspera = Math.max(
    1,
    ...esperas.map((e) => e.tempo_medio_espera_minutos ?? 0)
  );

  const gruposPlantao = useMemo(() => {
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
      title="Relatório — Unidades"
      subtitle="Estatísticas mensais, tempo de espera e plantões por unidade"
    >
      {/* Estatísticas mensais (principal) */}
      <Card
        icon={<CalendarRange className="h-5 w-5" />}
        title="Estatísticas mensais"
        subtitle={`Atendimentos por unidade em ${MESES[mes - 1]} de ${ano}`}
        className="mb-8"
        action={
          <div className="flex gap-2">
            <select
              className="input"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
            >
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {mensal.loading ? (
          <Spinner label="Carregando estatísticas..." />
        ) : mensal.error ? (
          <EmptyState title="Erro ao carregar" description={mensal.error} />
        ) : mensais.length === 0 ? (
          <EmptyState
            title={`Sem dados em ${MESES[mes - 1]} de ${ano}`}
            description="Nenhum atendimento registrado neste mês. Selecione outro mês ou ano."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {mensais.map((item, i) => (
              <li
                key={`${item.nome_unidade}-${i}`}
                className="rounded-xl border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-semibold text-slate-800">
                    <Building2 className="h-4 w-4 text-brand-500" />
                    {item.nome_unidade}
                  </span>
                  <Badge tone="brand">{item.total_atendimentos} atend.</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    Duração média:{" "}
                    <strong className="text-slate-700">
                      {item.media_duracao_minutos != null
                        ? `${item.media_duracao_minutos} min`
                        : "—"}
                    </strong>
                  </span>
                  <span>
                    Procedimento mais comum:{" "}
                    <strong className="text-slate-700">
                      {item.procedimento_mais_comum}
                    </strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Tempo médio de espera */}
      <Card
        icon={<Timer className="h-5 w-5" />}
        title="Tempo médio de espera por unidade"
        subtitle="Minutos entre o atendimento e o 1º procedimento"
        className="mb-8"
      >
        {espera.loading ? (
          <Spinner label="Carregando..." />
        ) : espera.error ? (
          <EmptyState title="Erro ao carregar" description={espera.error} />
        ) : esperas.length === 0 ? (
          <EmptyState title="Sem dados" />
        ) : (
          <ul className="space-y-3">
            {esperas.map((e) => (
              <li key={`${e.id_unidade}-${e.unidade}`}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{e.unidade}</span>
                  <span className="font-bold text-brand-700">
                    {e.tempo_medio_espera_minutos != null
                      ? `${e.tempo_medio_espera_minutos} min`
                      : "—"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{
                      width: `${((e.tempo_medio_espera_minutos ?? 0) / maxEspera) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {e.total_atendimentos_analisados} atendimento(s) analisado(s)
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Plantões por unidade */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Plantões por unidade
      </h2>
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          A escala é definida por <strong>dia da semana e turno</strong> (não possui data),
          portanto o total considera todos os plantões escalados por residente em cada
          unidade.
        </p>
      </div>

      {plantoes.loading ? (
        <Card>
          <Spinner label="Carregando plantões..." />
        </Card>
      ) : plantoes.error ? (
        <Card>
          <EmptyState title="Erro ao carregar" description={plantoes.error} />
        </Card>
      ) : gruposPlantao.length === 0 ? (
        <Card>
          <EmptyState title="Nenhum plantão escalado" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {gruposPlantao.map(([unidade, itens]) => (
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
