import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../ui/Toast";
import { api } from "../../api/client";
import { formatDateTime } from "../../lib/format";
import type { Atendimento, Paciente, ProcedimentoRealizado } from "../../types";

interface Props {
  paciente: Paciente | null;
  open: boolean;
  onClose: () => void;
}

interface AtendimentoComProcedimentos extends Atendimento {
  procedimentos: ProcedimentoRealizado[];
}

export function AtendimentosModal({ paciente, open, onClose }: Props) {
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<AtendimentoComProcedimentos[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!paciente) return;
    setLoading(true);
    setErro(null);
    try {
      const atendimentos = await api.listarAtendimentos(paciente.id_pessoa);
      const comProcedimentos = await Promise.all(
        atendimentos.map(async (a) => ({
          ...a,
          procedimentos: await api.listarProcedimentos(a.id_atendimento),
        }))
      );
      setDados(comProcedimentos);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar atendimentos.");
    } finally {
      setLoading(false);
    }
  }, [paciente]);

  useEffect(() => {
    if (open) carregar();
    else setDados([]);
  }, [open, carregar]);

  async function remover(idAtendimento: number, idProcedimento: number) {
    const chave = `${idAtendimento}-${idProcedimento}`;
    setRemovendo(chave);
    try {
      await api.removerProcedimento(idProcedimento, idAtendimento);
      notify("success", "Procedimento removido com sucesso.");
      setDados((prev) =>
        prev.map((a) =>
          a.id_atendimento === idAtendimento
            ? {
                ...a,
                procedimentos: a.procedimentos.filter(
                  (p) => p.id_procedimento !== idProcedimento
                ),
              }
            : a
        )
      );
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Erro ao remover procedimento.");
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      icon={<Stethoscope className="h-5 w-5" />}
      title={paciente?.nome ?? "Atendimentos"}
      subtitle={`Atendimentos e procedimentos${
        paciente?.num_convenio ? ` · Convênio ${paciente.num_convenio}` : ""
      }`}
    >
      {loading ? (
        <Spinner label="Carregando atendimentos..." />
      ) : erro ? (
        <EmptyState title="Não foi possível carregar" description={erro} />
      ) : dados.length === 0 ? (
        <EmptyState
          title="Nenhum atendimento"
          description="Este paciente ainda não possui atendimentos registrados."
        />
      ) : (
        <div className="space-y-4">
          {dados.map((a) => (
            <div
              key={a.id_atendimento}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                <span className="font-bold text-slate-700">
                  Atendimento #{a.id_atendimento}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <CalendarDays className="h-4 w-4" /> {formatDateTime(a.data_hora)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-4 w-4" /> {a.duracao_minutos} min
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <UserRound className="h-4 w-4" /> Residente:{" "}
                  <span className="font-medium text-slate-700">
                    {a.nome_residente ?? `#${a.id_residente}`}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Stethoscope className="h-4 w-4" /> Preceptor:{" "}
                  <span className="font-medium text-slate-700">
                    {a.nome_preceptor ?? `#${a.id_preceptor}`}
                  </span>
                </span>
              </div>
              <div className="p-3">
                {a.procedimentos.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-slate-400">
                    Nenhum procedimento registrado neste atendimento.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {a.procedimentos.map((p) => (
                      <li
                        key={p.id_procedimento}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700">
                            {p.nome_procedimento}
                          </p>
                          <p className="text-xs text-slate-400">
                            Quantidade: {p.quantidade}
                            {p.tempo_real != null ? ` · Tempo real: ${p.tempo_real} min` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.faturado ? (
                            <Badge tone="success">Faturado</Badge>
                          ) : (
                            <Badge tone="warning">Não Faturado</Badge>
                          )}
                          {!p.faturado && (
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={
                                removendo === `${a.id_atendimento}-${p.id_procedimento}`
                              }
                              onClick={() => remover(a.id_atendimento, p.id_procedimento)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remover procedimento
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
