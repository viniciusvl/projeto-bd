import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  ChevronDown,
  GraduationCap,
  HeartPulse,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition";
const activeCls = "bg-brand-600 text-white shadow-sm";
const inactiveCls = "text-slate-600 hover:bg-brand-50 hover:text-brand-700";

const reportItems = [
  { to: "/relatorios/residentes", label: "Residentes", icon: GraduationCap },
  { to: "/relatorios/preceptores", label: "Preceptores", icon: UserCog },
  { to: "/relatorios/plantoes", label: "Plantões", icon: CalendarClock },
  { to: "/relatorios/pacientes", label: "Pacientes", icon: HeartPulse },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const inReports = location.pathname.startsWith("/relatorios");
  const [openReports, setOpenReports] = useState(inReports);

  useEffect(() => {
    if (inReports) setOpenReports(true);
  }, [inReports]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-brand-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center border-b border-slate-100 px-6 py-6">
          <img
            src="/logo-sistema.png"
            alt="Dr. Yuska Maritan Brito — Sistema de Gerenciamento"
            className="h-44 w-44 object-contain"
          />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLink
            to="/atendimento"
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeCls : inactiveCls}`
            }
          >
            <Stethoscope className="h-5 w-5" /> Atendimento
          </NavLink>

          <NavLink
            to="/pacientes"
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeCls : inactiveCls}`
            }
          >
            <Users className="h-5 w-5" /> Pacientes
          </NavLink>

          <button
            type="button"
            onClick={() => setOpenReports((o) => !o)}
            className={`${linkBase} w-full justify-between ${
              inReports ? "text-brand-700" : inactiveCls
            }`}
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" /> Relatórios
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${openReports ? "rotate-180" : ""}`}
            />
          </button>

          {openReports && (
            <div className="ml-3 space-y-1 border-l border-slate-100 pl-3">
              {reportItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeCls : inactiveCls}`
                  }
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-slate-100 px-4 py-3 text-center text-[11px] leading-relaxed text-slate-400">
          Sistema de Gerenciamento
          <br />
          Dr. Yuska Maritan Brito
        </div>
      </aside>
    </>
  );
}
