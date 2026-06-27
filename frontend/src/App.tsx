import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { PublicHomePage } from './features/public/PublicHomePage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { QuickRegisterPage } from './features/children/QuickRegisterPage';
import { ExpedientesListPage } from './features/children/ExpedientesListPage';
import { ExpedientePage } from './features/children/ExpedientePage';
import { SearchPage } from './features/search/SearchPage';
import { UsersPage } from './features/users/UsersPage';

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/emergencia" element={<PublicHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/panel" element={<AppLayout />}>
            <Route index element={<Navigate to="/panel/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="registrar" element={<QuickRegisterPage />} />
            <Route path="expedientes" element={<ExpedientesListPage />} />
            <Route path="expedientes/:id" element={<ExpedientePage />} />
            <Route path="buscar" element={<SearchPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="tokens" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
