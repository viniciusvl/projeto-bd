import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AtendimentoPage } from "./pages/AtendimentoPage";
import { PacientesPage } from "./pages/PacientesPage";
import { ResidentesPage } from "./pages/relatorios/ResidentesPage";
import { PreceptoresPage } from "./pages/relatorios/PreceptoresPage";
import { PlantoesPage } from "./pages/relatorios/PlantoesPage";
import { PacientesReportPage } from "./pages/relatorios/PacientesReportPage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/atendimento" replace />} />
        <Route path="/atendimento" element={<AtendimentoPage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/relatorios/residentes" element={<ResidentesPage />} />
        <Route path="/relatorios/preceptores" element={<PreceptoresPage />} />
        <Route path="/relatorios/plantoes" element={<PlantoesPage />} />
        <Route path="/relatorios/pacientes" element={<PacientesReportPage />} />
        <Route path="*" element={<Navigate to="/atendimento" replace />} />
      </Routes>
    </ToastProvider>
  );
}
