import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { DashboardPage } from "./pages/DashboardPage";
import { AtendimentoPage } from "./pages/AtendimentoPage";
import { PacientesPage } from "./pages/PacientesPage";
import { EscalaPage } from "./pages/EscalaPage";
import { DesempenhoPage } from "./pages/relatorios/DesempenhoPage";
import { UnidadesPage } from "./pages/relatorios/UnidadesPage";
import { PacientesReportPage } from "./pages/relatorios/PacientesReportPage";
import { ProcedimentosPage } from "./pages/relatorios/ProcedimentosPage";
import { AuditoriaPage } from "./pages/relatorios/AuditoriaPage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/atendimento" element={<AtendimentoPage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/escala" element={<EscalaPage />} />
        <Route path="/relatorios/desempenho" element={<DesempenhoPage />} />
        <Route path="/relatorios/unidades" element={<UnidadesPage />} />
        <Route path="/relatorios/pacientes" element={<PacientesReportPage />} />
        <Route path="/relatorios/procedimentos" element={<ProcedimentosPage />} />
        <Route path="/relatorios/auditoria" element={<AuditoriaPage />} />
        {/* Redirects das rotas antigas de relatório */}
        <Route
          path="/relatorios/residentes"
          element={<Navigate to="/relatorios/desempenho" replace />}
        />
        <Route
          path="/relatorios/preceptores"
          element={<Navigate to="/relatorios/desempenho" replace />}
        />
        <Route
          path="/relatorios/plantoes"
          element={<Navigate to="/relatorios/unidades" replace />}
        />
        <Route
          path="/relatorios/estatisticas"
          element={<Navigate to="/relatorios/unidades" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}