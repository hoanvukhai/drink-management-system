// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import MainPage from './features/main/pages/MainPage';
import TableDetailPage from './features/main/pages/TableDetailPage';
import TakeawayPage from './features/main/pages/TakeawayPage';
import KitchenPage from './features/kitchen/pages/KitchenPage';
import OrderHistoryPage from './features/orders/pages/OrderHistoryPage';
import MenuManagementPage from './features/menu/pages/MenuManagementPage';
import StaffManagementPage from './features/staff/pages/StaffManagementPage';
import ZonesManagementPage from './features/zones/pages/ZonesManagementPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Default redirect -> Main */}
            <Route path="/" element={<Navigate to="/main" replace />} />

            {/* 🔥 Main Tabs */}
            <Route path="/main" element={<MainPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />

            {/* Table Detail & Takeaway */}
            <Route path="/table/:tableId" element={<TableDetailPage />} />
            <Route path="/takeaway" element={<TakeawayPage />} />

            {/* Order History */}
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* Admin & Manager only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="/menu" element={<MenuManagementPage />} />
              <Route path="/zones" element={<ZonesManagementPage />} />
              <Route path="/staff" element={<StaffManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;