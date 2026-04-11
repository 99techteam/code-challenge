import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { NewCampaignPage } from './pages/NewCampaignPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
            <Route path="/campaigns/new" element={<ProtectedRoute><NewCampaignPage /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/campaigns" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
