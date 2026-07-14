import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import TradeDetailPage from './pages/TradeDetailPage';
import ProfilePage from './pages/ProfilePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/new" element={<CreateListingPage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<CreateOrderPage />} />
        <Route path="trades/:id" element={<TradeDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

const BASE = import.meta.env.BASE_URL;

export default function App() {
  return (
    <BrowserRouter basename={BASE}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
