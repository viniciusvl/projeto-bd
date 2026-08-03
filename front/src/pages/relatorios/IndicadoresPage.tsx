import { useMemo } from "react";
import { Clock3, Heart, Percent } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { formatDateTime } from "../../lib/format";
import { api } from "../../api/client";
import type {
  PercentualAltoRisco,
  PreceptorFlamenguista,
  UltimoAtendimento,
} from "../../types";

// Acima deste percentual, o badge muda de "brand" (informativo) para
// "warning" (chama mais atenção). Ajuste livremente conforme o critério
// clínico da equipe.
const LIMIAR_ALERTA_ALTO_RISCO = 50;

export function IndicadoresPage() {
  const ultimos = useFetch<UltimoAtendimento[]>(() =>
    api.ultimoAtendimentoPorPaciente()
  );
  const flamenguistas = useFetch<PreceptorFlamenguista[]>(() =>
    api.preceptoresFlamenguistas()
  );
  const percentuais = useFetch<PercentualAltoRisco[]>(() =>
    api.percentualAltoRiscoPorResidente()
  );

  const listaUltimos = useMemo(() => ultimos.data ?? [], [ultimos.data]);
  const listaFlamenguistas = useMemo(
    () => flamenguistas.data ?? [],
    [flamenguistas.data]
  );
  const listaPercentuais = useMemo(
    () => percentuais.data ?? [],
    [percentuais.data]
  );

  return (
    <AppLayout
      title="Indicadores"
      subtitle="Consultas analíticas adicionais sobre atendimentos, preceptores e risco"
    >
      {/* Último atendimento por paciente */}
      <Card
        icon={<Clock3 className="h-5 w-5" />}
        title="Último atendimento por paciente"
        subtitle={`${listaUltimos.length} paciente(s) com atendimento registrado`}
      >
        {ultimos.loading ? (
          <Spinner label="Carregando últimos atendimentos..." />
        ) : ultimos.error ? (
          <EmptyState title="Erro ao carregar" description={ultimos.error} />
        ) : listaUltimos.length === 0 ? (
          <EmptyState
            title="Nenhum atendimento encontrado"
            description="Ainda não há atendimentos registrados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Paciente</th>
                  <th className="th">Data/Hora</th>
                  <th className="th">Residente</th>
                  <th className="th">Preceptor</th>
                  <th className="th">Procedimentos</th>
                </tr>
              </thead>
              <tbody>
                {listaUltimos.map((a, i) => (
                  <tr key={`${a.paciente}-${i}`} className="tr">
                    <td className="td font-semibold text-slate-800">
                      {a.paciente}
                    </td>
                    <td className="td">{formatDateTime(a.data_hora)}</td>
                    <td className="td">{a.residente}</td>
                    <td className="td">{a.preceptor}</td>
                    <td className="td">
                      {a.procedimentos.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {a.procedimentos.map((p, j) => (
                            <Badge key={`${p}-${j}`} tone="brand">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preceptores de residentes que atenderam flamenguistas */}
        <Card
          icon={<Heart className="h-5 w-5" />}
          title="Preceptores com pacientes flamenguistas"
          subtitle="Supervisionaram residentes que atenderam torcedores do Flamengo"
        >
          {flamenguistas.loading ? (
            <Spinner label="Carregando preceptores..." />
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
                  <span className="font-semibold text-slate-800">
                    {p.nome_preceptor}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Percentual de procedimentos de alto risco por residente */}
        <Card
          icon={<Percent className="h-5 w-5" />}
          title="% de alto risco por residente"
          subtitle="Proporção de procedimentos de risco alto sobre o total realizado"
        >
          {percentuais.loading ? (
            <Spinner label="Carregando indicadores..." />
          ) : percentuais.error ? (
            <EmptyState title="Erro ao carregar" description={percentuais.error} />
          ) : listaPercentuais.length === 0 ? (
            <EmptyState
              title="Nenhum residente encontrado"
              description="Nenhum procedimento realizado foi registrado ainda."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="th">Residente</th>
                    <th className="th text-right">Total</th>
                    <th className="th text-right">Alto risco</th>
                    <th className="th text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPercentuais.map((r, i) => (
                    <tr key={`${r.residente}-${i}`} className="tr">
                      <td className="td font-semibold text-slate-800">
                        {r.residente}
                      </td>
                      <td className="td text-right">{r.total_procedimentos}</td>
                      <td className="td text-right">
                        {r.procedimentos_alto_risco}
                      </td>
                      <td className="td text-right">
                        <Badge
                          tone={
                            r.percentual_alto_risco >= LIMIAR_ALERTA_ALTO_RISCO
                              ? "warning"
                              : "brand"
                          }
                        >
                          {r.percentual_alto_risco.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}