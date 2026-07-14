import { useMemo, useState } from "react";
import { CalendarPlus, Eye, Search, Users } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { AtendimentosModal } from "../components/atendimento/AtendimentosModal";
import { NovoAtendimentoModal } from "../components/atendimento/NovoAtendimentoModal";
import { useFetch } from "../lib/useFetch";
import { api } from "../api/client";
import type { Paciente } from "../types";

export function AtendimentoPage() {
  const { data, loading, error } = useFetch<Paciente[]>(() => api.listarPacientes());
  const pacientes = useMemo(() => data ?? [], [data]);

  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Paciente | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const filtrados = useMemo(
    () =>
      pacientes.filter((p) =>
        p.nome.toLowerCase().includes(busca.trim().toLowerCase())
      ),
    [pacientes, busca]
  );

  return (
    <AppLayout
      title="Atendimento"
      subtitle="Selecione um paciente para visualizar seus atendimentos e procedimentos"
      actions={
        <Button onClick={() => setNovoOpen(true)}>
          <CalendarPlus className="h-4 w-4" /> Novo Atendimento
        </Button>
      }
    >
      <Card
        icon={<Users className="h-5 w-5" />}
        title="Pacientes"
        subtitle={`${filtrados.length} paciente(s)`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Buscar paciente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        }
      >
        {loading ? (
          <Spinner label="Carregando pacientes..." />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            title="Nenhum paciente encontrado"
            description="Ajuste a busca ou verifique se há pacientes cadastrados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Paciente</th>
                  <th className="th">Convênio</th>
                  <th className="th">Cidade / UF</th>
                  <th className="th text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id_pessoa} className="tr">
                    <td className="td">
                      <div className="font-semibold text-slate-800">{p.nome}</div>
                      <div className="text-xs text-slate-400">#{p.id_pessoa}</div>
                    </td>
                    <td className="td">{p.num_convenio ?? "—"}</td>
                    <td className="td">
                      {[p.cidade, p.estado].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="td text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelecionado(p)}
                      >
                        <Eye className="h-4 w-4" /> Ver atendimentos
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AtendimentosModal
        paciente={selecionado}
        open={!!selecionado}
        onClose={() => setSelecionado(null)}
      />
      <NovoAtendimentoModal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        pacientes={pacientes}
      />
    </AppLayout>
  );
}
