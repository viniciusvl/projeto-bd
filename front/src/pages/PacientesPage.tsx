import { useMemo, useState } from "react";
import { Pencil, Search, UserPlus, Users } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { EditarPacienteModal } from "../components/paciente/EditarPacienteModal";
import { NovoPacienteModal } from "../components/paciente/NovoPacienteModal";
import { useFetch } from "../lib/useFetch";
import { api } from "../api/client";
import type { Paciente } from "../types";

function enderecoResumo(p: Paciente): string {
  const linha = [p.logradouro, p.numero].filter(Boolean).join(", ");
  const local = [p.bairro, p.cidade, p.estado].filter(Boolean).join(" · ");
  return [linha, local].filter(Boolean).join(" — ") || "—";
}

export function PacientesPage() {
  const { data, loading, error, reload } = useFetch<Paciente[]>(() =>
    api.listarPacientes()
  );
  const pacientes = useMemo(() => data ?? [], [data]);

  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Paciente | null>(null);
  const [cadastrando, setCadastrando] = useState(false);

  const filtrados = useMemo(
    () =>
      pacientes.filter((p) =>
        p.nome.toLowerCase().includes(busca.trim().toLowerCase())
      ),
    [pacientes, busca]
  );

  return (
    <AppLayout
      title="Pacientes"
      subtitle="Gerencie os dados de convênio e endereço dos pacientes"
    >
      <Card
        icon={<Users className="h-5 w-5" />}
        title="Pacientes"
        subtitle={`${filtrados.length} paciente(s)`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Buscar paciente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Button onClick={() => setCadastrando(true)}>
              <UserPlus className="h-4 w-4" /> Novo paciente
            </Button>
          </div>
        }
      >
        {loading ? (
          <Spinner label="Carregando pacientes..." />
        ) : error ? (
          <EmptyState title="Erro ao carregar" description={error} />
        ) : filtrados.length === 0 ? (
          <EmptyState title="Nenhum paciente encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="th">Paciente</th>
                  <th className="th">Convênio</th>
                  <th className="th">Endereço</th>
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
                    <td className="td max-w-xs text-slate-500">{enderecoResumo(p)}</td>
                    <td className="td text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelecionado(p)}
                      >
                        <Pencil className="h-4 w-4" /> Editar dados
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <EditarPacienteModal
        paciente={selecionado}
        open={!!selecionado}
        onClose={() => setSelecionado(null)}
        onSaved={reload}
      />

      <NovoPacienteModal
        open={cadastrando}
        onClose={() => setCadastrando(false)}
        onCreated={reload}
      />
    </AppLayout>
  );
}
