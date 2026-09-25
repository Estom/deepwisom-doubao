import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import LandingPage from "@/pages/LandingPage/LandingPage";
import AuthPage from "@/pages/AuthPage/AuthPage";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import WorkspacePage from "@/pages/WorkspacePage/WorkspacePage";
import TemplatesPage from "@/pages/TemplatesPage/TemplatesPage";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="workspace/:projectId" element={<WorkspacePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
