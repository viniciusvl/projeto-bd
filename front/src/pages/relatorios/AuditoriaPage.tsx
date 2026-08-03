import { useCallback, useEffect, useState } from "react";
import { ArrowRight, History } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatDateTime } from "../../lib/format";
import { api } from "../../api/client";
import type { AuditoriaAtendimento } from "../../types";

type Tone = "success" | "warning" | "neutral" | "brand" | "danger";

const OPERACAO: Record<string, { label: string; tone: Tone }> = {
  INSERT: { label: "Criação", tone: "success" },
  UPDATE: { label: "Alteração", tone: "brand" },
  DELETE: { label: "Exclusão", tone: "danger" },
};

const PAGINA = 15;

interface Campo {
  label: string;
  antigo?: string | null;
  novo?: string | null;
}

function minutos(v?: number | null): string | null {
  return v != null ? `${v} min` : null;
}

function dataHora(v?: string | null): string | null {
  return v ? formatDateTime(v) : null;
}

function ValorLinha({ campo, op }: { campo: Campo; op: string }) {
  const { label, antigo, novo } = campo;

  if (op === "UPDATE") {
    if ((antigo ?? null) === (novo ?? null)) return null;
    return (
      <li className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500">{label}:</span>
        <span className="text-slate-400 line-through">{antigo ?? "—"}</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="font-medium text-slate-700">{novo ?? "—"}</span>
      </li>
    );
  }

  // INSERT mostra os valores novos; DELETE mostra os valores antigos.
  const valor = op === "DELETE" ? antigo : novo;
  if (valor == null) return null;
  return (
    <li className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-semibold text-slate-500">{label}:</span>
      <span className="font-medium text-slate-700">{valor}</span>
    </li>
  );
}

export function AuditoriaPage() {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const [registros, setRegistros] = useState<AuditoriaAtendimento[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(
    async (reset: boolean, cursor?: number) => {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMais(true);
      }
      try {
        const page = await api.auditoriaAtendimentos({
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
          cursor: reset ? undefined : cursor,
          limite: PAGINA,
        });
        setRegistros((prev) => (reset ? page.items : [...prev, ...page.items]));
        setNextCursor(page.next_cursor);
        setTotal(page.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar auditoria.");
      } finally {
        setLoading(false);
        setLoadingMais(false);
      }
    },
    [dataInicial, dataFinal]
  );

  // Recarrega do início sempre que os filtros de data mudam.
  useEffect(() => {
    buscar(true);
  }, [buscar]);

  const temFiltro = dataInicial !== "" || dataFinal !== "";

  return (
    <AppLayout
      title="Relatório — Auditoria"
      subtitle="Histórico de criação, alteração e exclusão de atendimentos"
    >
      <Card
        icon={<History className="h-5 w-5" />}
        title="Auditoria de atendimentos"
        subtitle={`${registros.length} registro(s) carregado(s) de ${total}`}
        action={
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-medium text-slate-500">
              <span className="mb-1 block">Data inicial</span>
              <input
                type="date"
                className="input"
                value={dataInicial}
                max={dataFinal || undefined}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-slate-500">
              <span className="mb-1 block">Data final</span>
              <input
                type="date"
                className="input"
                value={dataFinal}
                min={dataInicial || undefined}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </label>
            {temFiltro && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDataInicial("");
                  setDataFinal("");
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        }
      >
        {loading ? (
          <Spinner label="Carregando histórico..." />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : registros.length === 0 ? (
          <EmptyState
            title="Nenhum registro encontrado"
            description={
              temFiltro
                ? "Nenhuma movimentação de atendimento no período selecionado."
                : "Ainda não há registros de auditoria."
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {registros.map((a) => {
                const op = OPERACAO[a.operacao] ?? {
                  label: a.operacao,
                  tone: "neutral" as Tone,
                };
                const campos: Campo[] = [
                  { label: "Paciente", antigo: a.paciente_antigo, novo: a.paciente_novo },
                  { label: "Residente", antigo: a.residente_antigo, novo: a.residente_novo },
                  { label: "Preceptor", antigo: a.preceptor_antigo, novo: a.preceptor_novo },
                  { label: "Unidade", antigo: a.unidade_antigo, novo: a.unidade_novo },
                  {
                    label: "Data/hora",
                    antigo: dataHora(a.data_hora_antigo),
                    novo: dataHora(a.data_hora_novo),
                  },
                  {
                    label: "Duração",
                    antigo: minutos(a.duracao_minutos_antigo),
                    novo: minutos(a.duracao_minutos_novo),
                  },
                ];
                const linhas = campos
                  .map((c) => <ValorLinha key={c.label} campo={c} op={a.operacao} />)
                  .filter(Boolean);

                return (
                  <li
                    key={a.id_auditoria}
                    className="rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Badge tone={op.tone}>{op.label}</Badge>
                        <span className="text-sm font-semibold text-slate-800">
                          Atendimento #{a.id_atendimento ?? "—"}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(a.registrado_em)}
                      </span>
                    </div>
                    {linhas.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                        {linhas}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {nextCursor != null && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => buscar(false, nextCursor)}
                  disabled={loadingMais}
                >
                  {loadingMais ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </AppLayout>
  );
}
