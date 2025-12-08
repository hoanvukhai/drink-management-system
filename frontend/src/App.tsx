// frontend/src/App.tsx - KIỂM TRA ROUTES
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import LoginPage from './features/auth/pages/LoginPage';
import MainPage from './features/main/pages/MainPage';
import TableDetailPage from './features/main/pages/TableDetailPage'; // 👈 Đúng import
import TakeawayPage from './features/main/pages/TakeawayPage';
import KitchenPage from './features/kitchen/pages/KitchenPage';
import OrderHistoryPage from './features/orders/pages/OrderHistoryPage';
import MenuManagementPage from './features/menu/pages/MenuManagementPage';
import StaffManagementPage from './features/staff/pages/StaffManagementPage';
import ZonesManagementPage from './features/zones/pages/ZonesManagementPage';
import RecipeManagementPage from './features/recipes/pages/RecipeManagementPage';
import InventoryManagementPage from './features/inventory/pages/InventoryManagementPage';
import HRManagementPage from './features/hr/pages/HRManagementPage';
import ExpensesManagementPage from './features/expenses/pages/ExpensesManagementPage';
import ReportsPage from './features/reports/pages/ReportsPage';
import InventoryHistoryPage from './features/inventory/pages/InventoryHistoryPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/main" replace />} />

            {/* Main Tabs */}
            <Route path="/main" element={<MainPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />

            {/* 👇 QUAN TRỌNG: Route này phải đúng */}
            <Route path="/table/:tableId" element={<TableDetailPage />} />
            <Route path="/takeaway" element={<TakeawayPage />} />

            {/* Order History */}
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* Admin & Manager only */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="/menu" element={<MenuManagementPage />} />
              <Route path="/zones" element={<ZonesManagementPage />} />
              <Route path="/staff" element={<StaffManagementPage />} />
              <Route path="/recipes" element={<RecipeManagementPage />} />
              <Route path="/inventory" element={<InventoryManagementPage />} />
              <Route path="/hr" element={<HRManagementPage />} />
              <Route path="/expenses" element={<ExpensesManagementPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/inventory-history" element={<InventoryHistoryPage />} />
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