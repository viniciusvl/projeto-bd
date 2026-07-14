import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { UserCog } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { api } from "../../api/client";
import type { Paciente, PacienteUpdate } from "../../types";

interface Props {
  paciente: Paciente | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const campos = [
  "num_convenio",
  "estado",
  "cidade",
  "bairro",
  "logradouro",
  "numero",
] as const;

type CampoForm = Record<(typeof campos)[number], string>;

const vazio: CampoForm = {
  num_convenio: "",
  estado: "",
  cidade: "",
  bairro: "",
  logradouro: "",
  numero: "",
};

export function EditarPacienteModal({ paciente, open, onClose, onSaved }: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState<CampoForm>(vazio);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open && paciente) {
      setForm({
        num_convenio: paciente.num_convenio ?? "",
        estado: paciente.estado ?? "",
        cidade: paciente.cidade ?? "",
        bairro: paciente.bairro ?? "",
        logradouro: paciente.logradouro ?? "",
        numero: paciente.numero ?? "",
      });
    }
  }, [open, paciente]);

  function update(key: keyof CampoForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!paciente) return;

    // Envia apenas os campos alterados (a API mantém os demais via COALESCE).
    const payload: PacienteUpdate = { id_pessoa: paciente.id_pessoa };
    let mudou = false;
    for (const c of campos) {
      const novo = form[c].trim();
      const antigo = (paciente[c] ?? "").toString();
      if (novo !== "" && novo !== antigo) {
        payload[c] = novo;
        mudou = true;
      }
    }

    if (!mudou) {
      notify("success", "Nenhuma alteração para salvar.");
      onClose();
      return;
    }

    setSalvando(true);
    try {
      await api.atualizarPaciente(payload);
      notify("success", "Dados do paciente atualizados com sucesso.");
      onSaved();
      onClose();
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Erro ao atualizar paciente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<UserCog className="h-5 w-5" />}
      title={`Editar dados — ${paciente?.nome ?? ""}`}
      subtitle="Atualize o convênio ou o endereço do paciente"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-editar-paciente" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      }
    >
      <form id="form-editar-paciente" onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Número do convênio</label>
          <input
            className="input"
            placeholder="Ex.: CONV-1001"
            value={form.num_convenio}
            onChange={(e) => update("num_convenio", e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            Endereço
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Logradouro</label>
              <input
                className="input"
                placeholder="Rua / Avenida"
                value={form.logradouro}
                onChange={(e) => update("logradouro", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Número</label>
              <input
                className="input"
                value={form.numero}
                onChange={(e) => update("numero", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Bairro</label>
              <input
                className="input"
                value={form.bairro}
                onChange={(e) => update("bairro", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input
                className="input"
                value={form.cidade}
                onChange={(e) => update("cidade", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Estado (UF)</label>
              <input
                className="input"
                maxLength={2}
                placeholder="Ex.: PB"
                value={form.estado}
                onChange={(e) => update("estado", e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Campos deixados em branco não serão alterados.
        </p>
      </form>
    </Modal>
  );
}
