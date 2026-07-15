import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarPlus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { api } from "../../api/client";
import type { Paciente, Profissional } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  pacientes: Paciente[];
  onCreated?: () => void;
}

const inicial = {
  data_hora: "",
  duracao_minutos: "",
  id_paciente: "",
  id_residente: "",
  id_preceptor: "",
};

export function NovoAtendimentoModal({ open, onClose, pacientes, onCreated }: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [residentes, setResidentes] = useState<Profissional[]>([]);
  const [preceptores, setPreceptores] = useState<Profissional[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(inicial);
    Promise.all([api.listarResidentes(), api.listarPreceptores()])
      .then(([res, prec]) => {
        setResidentes(res);
        setPreceptores(prec);
      })
      .catch((e) =>
        notify(
          "error",
          e instanceof Error ? e.message : "Erro ao carregar residentes e preceptores."
        )
      );
  }, [open, notify]);

  function update<K extends keyof typeof inicial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.criarAtendimento({
        data_hora: form.data_hora,
        duracao_minutos: Number(form.duracao_minutos),
        id_paciente: Number(form.id_paciente),
        id_residente: Number(form.id_residente),
        id_preceptor: Number(form.id_preceptor),
      });
      notify("success", "Atendimento criado com sucesso.");
      onCreated?.();
      onClose();
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Erro ao criar atendimento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={<CalendarPlus className="h-5 w-5" />}
      title="Novo atendimento"
      subtitle="Registrar um novo atendimento"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-novo-atendimento" disabled={salvando}>
            {salvando ? "Salvando..." : "Criar atendimento"}
          </Button>
        </div>
      }
    >
      <form id="form-novo-atendimento" onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Data e hora</label>
          <input
            required
            type="datetime-local"
            className="input"
            value={form.data_hora}
            onChange={(e) => update("data_hora", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Duração (minutos)</label>
          <input
            required
            type="number"
            min={1}
            className="input"
            placeholder="Ex.: 45"
            value={form.duracao_minutos}
            onChange={(e) => update("duracao_minutos", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Paciente</label>
          <select
            required
            className="input"
            value={form.id_paciente}
            onChange={(e) => update("id_paciente", e.target.value)}
          >
            <option value="">Selecione...</option>
            {pacientes.map((p) => (
              <option key={p.id_pessoa} value={p.id_pessoa}>
                {p.nome} (#{p.id_pessoa})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Residente</label>
            <select
              required
              className="input"
              value={form.id_residente}
              onChange={(e) => update("id_residente", e.target.value)}
            >
              <option value="">Selecione...</option>
              {residentes.map((r) => (
                <option key={r.id_profissional} value={r.id_profissional}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Preceptor</label>
            <select
              required
              className="input"
              value={form.id_preceptor}
              onChange={(e) => update("id_preceptor", e.target.value)}
            >
              <option value="">Selecione...</option>
              {preceptores.map((p) => (
                <option key={p.id_profissional} value={p.id_profissional}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
