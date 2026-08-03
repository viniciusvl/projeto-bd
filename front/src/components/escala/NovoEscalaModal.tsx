import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarPlus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { api } from "../../api/client";
import type { Profissional, Unidade } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const DIAS = [
  { value: "domingo", label: "Domingo" },
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
];

const TURNOS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

const inicial = {
  id_unidade: "",
  dia_semana: "",
  turno: "",
  id_residente: "",
  id_preceptor: "",
};

export function NovoEscalaModal({ open, onClose, onCreated }: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [residentes, setResidentes] = useState<Profissional[]>([]);
  const [preceptores, setPreceptores] = useState<Profissional[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(inicial);
    Promise.all([
      api.listarUnidades(),
      api.listarResidentes(),
      api.listarPreceptores(),
    ])
      .then(([uni, res, prec]) => {
        setUnidades(uni);
        setResidentes(res);
        setPreceptores(prec);
      })
      .catch((e) =>
        notify(
          "error",
          e instanceof Error ? e.message : "Erro ao carregar dados do formulário."
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
      await api.criarEscala({
        id_unidade: Number(form.id_unidade),
        dia_semana: form.dia_semana,
        turno: form.turno,
        id_residente: Number(form.id_residente),
        id_preceptor: Number(form.id_preceptor),
      });
      notify("success", "Escala criada com sucesso.");
      onCreated?.();
      onClose();
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Erro ao criar escala.");
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
      title="Nova escala"
      subtitle="Escalar um residente para um plantão"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-nova-escala" disabled={salvando}>
            {salvando ? "Salvando..." : "Criar escala"}
          </Button>
        </div>
      }
    >
      <form id="form-nova-escala" onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Unidade</label>
          <select
            required
            className="input"
            value={form.id_unidade}
            onChange={(e) => update("id_unidade", e.target.value)}
          >
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id_unidade} value={u.id_unidade}>
                {u.nome} ({u.tipo})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Dia da semana</label>
            <select
              required
              className="input"
              value={form.dia_semana}
              onChange={(e) => update("dia_semana", e.target.value)}
            >
              <option value="">Selecione...</option>
              {DIAS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Turno</label>
            <select
              required
              className="input"
              value={form.turno}
              onChange={(e) => update("turno", e.target.value)}
            >
              <option value="">Selecione...</option>
              {TURNOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
      </form>
    </Modal>
  );
}
