import { useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CalendarDays,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { useFetch } from "../lib/useFetch";
import { formatDateTime } from "../lib/format";
import { api } from "../api/client";
import type {
  Escala,
  Paciente,
  PacienteInternado,
  ResidenteSemSupervisor,
} from "../types";

const DIA_LABEL: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

const TURNO_LABEL: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

function Kpi({
  icon,
  label,
  value,
  loading,
  alert,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  loading: boolean;
  alert?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          alert && value > 0
            ? "bg-amber-50 text-amber-600"
            : "bg-brand-50 text-brand-600"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-7 w-10 animate-pulse rounded bg-slate-100" />
        ) : (
          <p
            className={`text-2xl font-extrabold ${
              alert && value > 0 ? "text-amber-600" : "text-slate-800"
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const pacientes = useFetch<Paciente[]>(() => api.listarPacientes());
  const escalas = useFetch<Escala[]>(() => api.listarEscalas());
  const internados = useFetch<PacienteInternado[]>(() =>
    api.pacientesInternados()
  );
  const semSupervisor = useFetch<ResidenteSemSupervisor[]>(() =>
    api.residentesSemSupervisor()
  );

  const listaInternados = useMemo(() => internados.data ?? [], [internados.data]);
  const listaSemSupervisor = useMemo(
    () => semSupervisor.data ?? [],
    [semSupervisor.data]
  );

  return (
    <AppLayout
      title="Início"
      subtitle="Visão geral do sistema e alertas que exigem atenção"
    >
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<Users className="h-5 w-5" />}
          label="Pacientes"
          value={(pacientes.data ?? []).length}
          loading={pacientes.loading}
        />
        <Kpi
          icon={<CalendarDays className="h-5 w-5" />}
          label="Plantões na escala"
          value={(escalas.data ?? []).length}
          loading={escalas.loading}
        />
        <Kpi
          icon={<BedDouble className="h-5 w-5" />}
          label="Pacientes internados"
          value={listaInternados.length}
          loading={internados.loading}
        />
        <Kpi
          icon={<ShieldAlert className="h-5 w-5" />}
          label="Residentes sem supervisor"
          value={listaSemSupervisor.length}
          loading={semSupervisor.loading}
          alert
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Residentes sem supervisor */}
        <Card
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Residentes sem supervisor"
          subtitle="Plantões escalados sem supervisão adequada"
        >
          {semSupervisor.loading ? (
            <Spinner label="Carregando alertas..." />
          ) : semSupervisor.error ? (
            <EmptyState title="Erro ao carregar" description={semSupervisor.error} />
          ) : listaSemSupervisor.length === 0 ? (
            <EmptyState
              title="Tudo certo"
              description="Nenhum residente escalado está sem supervisão adequada."
            />
          ) : (
            <ul className="space-y-2">
              {listaSemSupervisor.map((r) => (
                <li
                  key={r.id_escala}
                  className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-800">
                      {r.nome_residente}
                    </span>
                    <Badge tone="warning">{r.nome_unidade}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>
                      {DIA_LABEL[r.dia_semana] ?? r.dia_semana} ·{" "}
                      {TURNO_LABEL[r.turno] ?? r.turno}
                    </span>
                    <span className="font-medium text-amber-700">
                      {r.motivo_alerta}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Pacientes internados */}
        <Card
          icon={<BedDouble className="h-5 w-5" />}
          title="Pacientes internados"
          subtitle="Internações atualmente ativas"
          action={
            <Link
              to="/relatorios/pacientes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Ver relatório <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {internados.loading ? (
            <Spinner label="Carregando internações..." />
          ) : internados.error ? (
            <EmptyState title="Erro ao carregar" description={internados.error} />
          ) : listaInternados.length === 0 ? (
            <EmptyState
              title="Sem internações ativas"
              description="Nenhum paciente está internado no momento."
            />
          ) : (
            <ul className="space-y-2">
              {listaInternados.map((p) => (
                <li
                  key={p.id_paciente}
                  className="rounded-lg border border-slate-100 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <Stethoscope className="h-4 w-4 text-brand-500" />
                      {p.nome_paciente}
                    </span>
                    <Badge tone="brand">{p.unidade_internacao}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>Entrada: {formatDateTime(p.data_entrada)}</span>
                    {p.motivo && (
                      <span>
                        Motivo:{" "}
                        <strong className="text-slate-700">{p.motivo}</strong>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
