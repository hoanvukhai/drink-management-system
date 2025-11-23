// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import TablePage from './features/tables/pages/TablePage';
import POSPage from './features/pos/pages/POSPage';
import OrderHistoryPage from './features/orders/pages/OrderHistoryPage';
import MenuManagementPage from './features/menu/pages/MenuManagementPage';
import StaffManagementPage from './features/staff/pages/StaffManagementPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes - Cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Default redirect -> Sơ đồ bàn */}
            <Route path="/" element={<Navigate to="/tables" replace />} />

            {/* Sơ đồ bàn - Tất cả role */}
            <Route path="/tables" element={<TablePage />} />

            {/* POS với tableId - Tất cả role */}
            <Route path="/pos/:tableId" element={<POSPage />} />

            {/* Orders - Tất cả role */}
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* Menu - Admin & Manager */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="/menu" element={<MenuManagementPage />} />
            </Route>

            {/* Staff - Admin & Manager */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="/staff" element={<StaffManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 - Redirect về tables */}
        <Route path="*" element={<Navigate to="/tables" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;