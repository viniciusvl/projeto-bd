import { useMemo, useState } from "react";
import { CalendarPlus, Moon, Sun, Sunset } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { NovoEscalaModal } from "../components/escala/NovoEscalaModal";
import { ReajustarEscalaModal } from "../components/escala/ReajustarEscalaModal";
import { useFetch } from "../lib/useFetch";
import { api } from "../api/client";
import type { Escala } from "../types";

const DIAS = [
  { key: "domingo", label: "Domingo", short: "Dom" },
  { key: "segunda", label: "Segunda", short: "Seg" },
  { key: "terca", label: "Terça", short: "Ter" },
  { key: "quarta", label: "Quarta", short: "Qua" },
  { key: "quinta", label: "Quinta", short: "Qui" },
  { key: "sexta", label: "Sexta", short: "Sex" },
  { key: "sabado", label: "Sábado", short: "Sáb" },
];

const TURNOS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "manha", label: "Manhã", icon: Sun },
  { key: "tarde", label: "Tarde", icon: Sunset },
  { key: "noite", label: "Noite", icon: Moon },
];

// Paleta para colorir os plantões por unidade (estilo Google Calendar).
// Strings completas para o Tailwind detectar as classes.
const CORES_UNIDADE = [
  "border-brand-200 bg-brand-50 text-brand-800",
  "border-emerald-200 bg-emerald-50 text-emerald-800",
  "border-amber-200 bg-amber-50 text-amber-800",
  "border-violet-200 bg-violet-50 text-violet-800",
  "border-rose-200 bg-rose-50 text-rose-800",
  "border-cyan-200 bg-cyan-50 text-cyan-800",
  "border-orange-200 bg-orange-50 text-orange-800",
];

const PONTOS_UNIDADE = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
];

function corUnidade(id: number): string {
  return CORES_UNIDADE[id % CORES_UNIDADE.length];
}

function pontoUnidade(id: number): string {
  return PONTOS_UNIDADE[id % PONTOS_UNIDADE.length];
}

export function EscalaPage() {
  const { data, loading, error, reload } = useFetch<Escala[]>(() =>
    api.listarEscalas()
  );
  const escalas = useMemo(() => data ?? [], [data]);
  const [novoOpen, setNovoOpen] = useState(false);
  const [reajustando, setReajustando] = useState<Escala | null>(null);

  const hoje = DIAS[new Date().getDay()]?.key;

  // Agrupa por "dia|turno" para posicionar na grade.
  const grade = useMemo(() => {
    const mapa = new Map<string, Escala[]>();
    for (const e of escalas) {
      const chave = `${e.dia_semana}|${e.turno}`;
      const atual = mapa.get(chave) ?? [];
      atual.push(e);
      mapa.set(chave, atual);
    }
    return mapa;
  }, [escalas]);

  // Unidades distintas presentes (para a legenda).
  const unidades = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const e of escalas) mapa.set(e.id_unidade, e.nome_unidade);
    return Array.from(mapa.entries());
  }, [escalas]);

  return (
    <AppLayout
      title="Escala"
      subtitle="Grade semanal de plantões — clique em um plantão para reajustar o dia/turno"
      actions={
        <Button onClick={() => setNovoOpen(true)}>
          <CalendarPlus className="h-4 w-4" /> Nova escala
        </Button>
      }
    >
      <Card
        title="Grade semanal"
        subtitle={`${escalas.length} plantão(ões) escalado(s)`}
        action={
          unidades.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {unidades.map(([id, nome]) => (
                <span
                  key={id}
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${pontoUnidade(id)}`}
                  />
                  {nome}
                </span>
              ))}
            </div>
          ) : undefined
        }
      >
        {loading ? (
          <Spinner label="Carregando escalas..." />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : escalas.length === 0 ? (
          <EmptyState
            title="Nenhuma escala cadastrada"
            description="Clique em “Nova escala” para escalar um residente."
          />
        ) : (
          <div className="w-full">
            <div className="grid w-full grid-cols-[56px_repeat(7,minmax(0,1fr))] overflow-hidden rounded-xl border border-slate-200">
              {/* Cabeçalho: canto + dias */}
              <div className="border-b border-r border-slate-200 bg-slate-50" />
              {DIAS.map((d) => {
                const ehHoje = d.key === hoje;
                return (
                  <div
                    key={d.key}
                    className={`border-b border-r border-slate-200 px-2 py-2.5 text-center last:border-r-0 ${
                      ehHoje ? "bg-brand-600 text-white" : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wide">
                      {d.short}
                    </div>
                    <div
                      className={`text-[11px] ${ehHoje ? "text-white/80" : "text-slate-400"}`}
                    >
                      {ehHoje ? "Hoje" : d.label}
                    </div>
                  </div>
                );
              })}

              {/* Linhas por turno */}
              {TURNOS.map((t, ti) => {
                const Icon = t.icon;
                const ultimaLinha = ti === TURNOS.length - 1;
                return (
                  <div key={t.key} className="contents">
                    <div
                      className={`flex flex-col items-center justify-center gap-1 border-r border-slate-200 bg-slate-50 px-1 py-3 text-center ${
                        ultimaLinha ? "" : "border-b"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-brand-500" />
                      <span className="text-xs font-semibold text-slate-600">
                        {t.label}
                      </span>
                    </div>
                    {DIAS.map((d) => {
                      const itens = grade.get(`${d.key}|${t.key}`) ?? [];
                      const ehHoje = d.key === hoje;
                      return (
                        <div
                          key={`${d.key}-${t.key}`}
                          className={`min-h-[92px] space-y-1.5 border-r border-slate-200 p-1.5 last:border-r-0 ${
                            ultimaLinha ? "" : "border-b"
                          } ${ehHoje ? "bg-brand-50/40" : "bg-white"}`}
                        >
                          {itens.map((e) => (
                            <button
                              key={e.id_escala}
                              type="button"
                              onClick={() => setReajustando(e)}
                              title={`${e.nome_unidade} • ${e.nome_residente} • Preceptor: ${e.nome_preceptor}\nClique para reajustar o dia/turno`}
                              className={`block w-full rounded-md border px-2 py-1.5 text-left transition hover:shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-brand-300 ${corUnidade(e.id_unidade)}`}
                            >
                              <div className="break-words text-xs font-semibold leading-tight">
                                {e.nome_unidade}
                              </div>
                              <div className="break-words text-[11px] leading-tight opacity-90">
                                {e.nome_residente}
                              </div>
                              <div className="break-words text-[11px] leading-tight opacity-70">
                                Prec.: {e.nome_preceptor}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <NovoEscalaModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onCreated={reload}
      />

      <ReajustarEscalaModal
        escala={reajustando}
        open={!!reajustando}
        onClose={() => setReajustando(null)}
        onReajustado={reload}
      />
    </AppLayout>
  );
}
