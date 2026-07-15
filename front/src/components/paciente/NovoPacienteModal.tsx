import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { api } from "../../api/client";
import type { PacienteCreate } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const GRUPOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const inicial = {
  nome: "",
  cpf: "",
  data_nascimento: "",
  is_flamengo: false,
  telefone: "",
  num_convenio: "",
  grupo_sanguineo: "",
  estado: "",
  cidade: "",
  bairro: "",
  logradouro: "",
  numero: "",
};

export function NovoPacienteModal({ open, onClose, onCreated }: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState(inicial);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) setForm(inicial);
  }, [open]);

  function update<K extends keyof typeof inicial>(key: K, value: (typeof inicial)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload: PacienteCreate = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        data_nascimento: form.data_nascimento,
        is_flamengo: form.is_flamengo,
        telefone: form.telefone.trim() || null,
        num_convenio: form.num_convenio.trim() || null,
        grupo_sanguineo: form.grupo_sanguineo || null,
        estado: form.estado.trim() || null,
        cidade: form.cidade.trim() || null,
        bairro: form.bairro.trim() || null,
        logradouro: form.logradouro.trim() || null,
        numero: form.numero.trim() || null,
      };
      await api.criarPaciente(payload);
      notify("success", "Paciente cadastrado com sucesso.");
      onCreated();
      onClose();
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Erro ao cadastrar paciente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<UserPlus className="h-5 w-5" />}
      title="Cadastrar paciente"
      subtitle="Informe os dados do novo paciente"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-novo-paciente" disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar paciente"}
          </Button>
        </div>
      }
    >
      <form id="form-novo-paciente" onSubmit={submit} className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            Dados pessoais
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Nome *</label>
              <input
                required
                className="input"
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
              />
            </div>
            <div>
              <label className="label">CPF *</label>
              <input
                required
                className="input"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => update("cpf", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Data de nascimento *</label>
              <input
                required
                type="date"
                className="input"
                value={form.data_nascimento}
                onChange={(e) => update("data_nascimento", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                className="input"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => update("telefone", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Grupo sanguíneo</label>
              <select
                className="input"
                value={form.grupo_sanguineo}
                onChange={(e) => update("grupo_sanguineo", e.target.value)}
              >
                <option value="">—</option>
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-300"
                checked={form.is_flamengo}
                onChange={(e) => update("is_flamengo", e.target.checked)}
              />
              <span className="text-sm text-slate-600">Torcedor do Flamengo</span>
            </label>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            Convênio e endereço
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Número do convênio</label>
              <input
                className="input"
                placeholder="Ex.: CONV-1001"
                value={form.num_convenio}
                onChange={(e) => update("num_convenio", e.target.value)}
              />
            </div>
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

        <p className="text-[11px] text-slate-400">Campos com * são obrigatórios.</p>
      </form>
    </Modal>
  );
}
