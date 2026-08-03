import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Move } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useToast } from "../ui/Toast";
import { api } from "../../api/client";
import type { Escala } from "../../types";

interface Props {
  escala: Escala | null;
  open: boolean;
  onClose: () => void;
  onReajustado?: () => void;
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

const DIA_LABEL: Record<string, string> = Object.fromEntries(
  DIAS.map((d) => [d.value, d.label.replace("-feira", "")])
);
const TURNO_LABEL: Record<string, string> = Object.fromEntries(
  TURNOS.map((t) => [t.value, t.label])
);

export function ReajustarEscalaModal({
  escala,
  open,
  onClose,
  onReajustado,
}: Props) {
  const { notify } = useToast();
  const [diaDestino, setDiaDestino] = useState("");
  const [turnoDestino, setTurnoDestino] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open && escala) {
      setDiaDestino(escala.dia_semana);
      setTurnoDestino(escala.turno);
    }
  }, [open, escala]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!escala) return;

    if (diaDestino === escala.dia_semana && turnoDestino === escala.turno) {
      notify("error", "Escolha um dia ou turno diferente do atual.");
      return;
    }

    setSalvando(true);
    try {
      await api.reajustarEscala({
        id_residente: escala.id_residente,
        dia_origem: escala.dia_semana,
        turno_origem: escala.turno,
        dia_destino: diaDestino,
        turno_destino: turnoDestino,
      });
      notify("success", "Plantão reajustado com sucesso.");
      onReajustado?.();
      onClose();
    } catch (err) {
      notify(
        "error",
        err instanceof Error ? err.message : "Erro ao reajustar o plantão."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={<Move className="h-5 w-5" />}
      title="Reajustar plantão"
      subtitle="Mover este plantão para outro dia e turno"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-reajustar-escala" disabled={salvando}>
            {salvando ? "Movendo..." : "Reajustar"}
          </Button>
        </div>
      }
    >
      {escala && (
        <form id="form-reajustar-escala" onSubmit={submit} className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <div className="font-semibold text-slate-800">{escala.nome_unidade}</div>
            <div className="text-slate-600">{escala.nome_residente}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span>De:</span>
              <Badge tone="neutral">
                {DIA_LABEL[escala.dia_semana] ?? escala.dia_semana} ·{" "}
                {TURNO_LABEL[escala.turno] ?? escala.turno}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              <Badge tone="brand">
                {DIA_LABEL[diaDestino] ?? diaDestino} ·{" "}
                {TURNO_LABEL[turnoDestino] ?? turnoDestino}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Novo dia</label>
              <select
                required
                className="input"
                value={diaDestino}
                onChange={(e) => setDiaDestino(e.target.value)}
              >
                {DIAS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Novo turno</label>
              <select
                required
                className="input"
                value={turnoDestino}
                onChange={(e) => setTurnoDestino(e.target.value)}
              >
                {TURNOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            A unidade e o preceptor permanecem os mesmos. O reajuste é bloqueado se o
            residente já tiver um plantão no dia/turno de destino.
          </p>
        </form>
      )}
    </Modal>
  );
}
