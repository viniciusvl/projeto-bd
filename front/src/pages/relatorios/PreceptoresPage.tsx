import { useState } from "react";
import { Info, UserCog } from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFetch } from "../../lib/useFetch";
import { api } from "../../api/client";
import { MESES } from "../../lib/format";
import type { PreceptorSupervisao } from "../../types";

const anoBase = new Date().getFullYear();
const anos = Array.from(
  new Set([anoBase + 1, anoBase, anoBase - 1, 2026, 2025, 2024])
).sort((a, b) => b - a);

export function PreceptoresPage() {
  const [ano, setAno] = useState(2026);
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const { data, loading, error } = useFetch<PreceptorSupervisao[]>(
    () => api.preceptoresSupervisao(ano, mes),
    [ano, mes]
  );
  const lista = data ?? [];

  return (
    <AppLayout
      title="Relatório — Preceptores"
      subtitle="Preceptores que supervisionaram mais de 5 atendimentos no mês selecionado"
    >
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
        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : lista.length === 0 ? (
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
                {lista.map((p, i) => (
                  <tr key={`${p.nome_preceptor}-${i}`} className="tr">
                    <td className="td font-medium text-slate-800">{p.nome_preceptor}</td>
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
