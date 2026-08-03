import { useState } from "react";
import { Heart, Info, Timer, Trophy, UserCog } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import { MESES } from "../../lib/format";
import type {
  PreceptorFlamenguista,
  PreceptorSupervisao,
  RankingPreceptor,
  RankingResidente,
  TempoMedio,
} from "../../types";

const anoBase = new Date().getFullYear();
const anos = Array.from(
  new Set([anoBase + 1, anoBase, anoBase - 1, 2026, 2025, 2024])
).sort((a, b) => b - a);

function medalha(i: number): string {
  if (i === 0) return "bg-amber-100 text-amber-700";
  if (i === 1) return "bg-slate-200 text-slate-600";
  if (i === 2) return "bg-orange-100 text-orange-700";
  return "bg-brand-50 text-brand-700";
}

export function DesempenhoPage() {
  const [ano, setAno] = useState(2026);
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const tempo = useFetch<TempoMedio[]>(() => api.tempoMedio());
  const rankingRes = useFetch<RankingResidente[]>(() => api.rankingResidentes());
  const rankingPrec = useFetch<RankingPreceptor[]>(() => api.rankingPreceptores());
  const supervisao = useFetch<PreceptorSupervisao[]>(
    () => api.preceptoresSupervisao(ano, mes),
    [ano, mes]
  );
  const flamenguistas = useFetch<PreceptorFlamenguista[]>(() =>
    api.preceptoresFlamenguistas()
  );

  const tempos = tempo.data ?? [];
  const ranksRes = rankingRes.data ?? [];
  const ranksPrec = rankingPrec.data ?? [];
  const supervisoes = supervisao.data ?? [];
  const listaFlamenguistas = flamenguistas.data ?? [];
  const maxTempo = Math.max(1, ...tempos.map((t) => t.tempo_medio_minutos ?? 0));

  return (
    <AppLayout
      title="Relatório — Desempenho"
      subtitle="Indicadores de residentes e preceptores"
    >
      {/* Residentes */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Residentes
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <span className="font-medium text-slate-700">
                      {t.nome_residente}
                    </span>
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
          {rankingRes.loading ? (
            <Spinner />
          ) : rankingRes.error ? (
            <EmptyState title="Erro ao carregar" description={rankingRes.error} />
          ) : ranksRes.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <ol className="space-y-2">
              {ranksRes.map((r, i) => (
                <li
                  key={`${r.nome}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${medalha(i)}`}
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

      {/* Preceptores */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Preceptores
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          icon={<Trophy className="h-5 w-5" />}
          title="Ranking de preceptores por consultas"
          subtitle="Total de atendimentos supervisionados (geral)"
        >
          {rankingPrec.loading ? (
            <Spinner />
          ) : rankingPrec.error ? (
            <EmptyState title="Erro ao carregar" description={rankingPrec.error} />
          ) : ranksPrec.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <ol className="space-y-2">
              {ranksPrec.map((r, i) => (
                <li
                  key={`${r.nome}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${medalha(i)}`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-slate-700">{r.nome}</span>
                  <span className="text-sm font-bold text-slate-800">
                    {r.total} consulta(s)
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card
          icon={<Heart className="h-5 w-5" />}
          title="Pacientes flamenguistas"
          subtitle="Preceptores que supervisionaram residentes que atenderam torcedores do Flamengo"
        >
          {flamenguistas.loading ? (
            <Spinner />
          ) : flamenguistas.error ? (
            <EmptyState title="Erro ao carregar" description={flamenguistas.error} />
          ) : listaFlamenguistas.length === 0 ? (
            <EmptyState
              title="Nenhum preceptor encontrado"
              description="Nenhum atendimento a paciente flamenguista foi registrado ainda."
            />
          ) : (
            <ul className="space-y-2">
              {listaFlamenguistas.map((p, i) => (
                <li
                  key={`${p.nome_preceptor}-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2.5"
                >
                  <Heart className="h-4 w-4 shrink-0 text-rose-500" />
                  <span className="font-medium text-slate-700">
                    {p.nome_preceptor}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Lista apenas preceptores com <strong>mais de 5</strong> supervisões no mês. Com
          os dados de exemplo o resultado costuma ficar vazio, pois nenhum preceptor
          ultrapassa esse total em um único mês.
        </p>
      </div>

      <Card
        icon={<UserCog className="h-5 w-5" />}
        title="Supervisões por preceptor"
        subtitle={`${MESES[mes - 1]} de ${ano}`}
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
        {supervisao.loading ? (
          <Spinner />
        ) : supervisao.error ? (
          <EmptyState title="Erro ao carregar" description={supervisao.error} />
        ) : supervisoes.length === 0 ? (
          <EmptyState
            title="Nenhum preceptor encontrado"
            description={`Nenhum preceptor supervisionou mais de 5 atendimentos em ${MESES[mes - 1]} de ${ano}.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Preceptor</th>
                  <th className="th text-right">Supervisões</th>
                </tr>
              </thead>
              <tbody>
                {supervisoes.map((p, i) => (
                  <tr key={`${p.nome_preceptor}-${i}`} className="tr">
                    <td className="td font-medium text-slate-800">
                      {p.nome_preceptor}
                    </td>
                    <td className="td text-right">
                      <Badge tone="brand">{p.total_supervisoes} atendimentos</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}