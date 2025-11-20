// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

import LoginPage from './pages/login';
import { AdminMenu } from './pages/AdminMenu';
import { OrderPage } from './pages/OrderPage';
import { OrderHistory } from './pages/OrderHistory';
import { StaffPage } from './pages/StaffPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* --- ROUTE CÔNG KHAI --- */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- ROUTE NỘI BỘ (Dùng chung MainLayout) --- */}
        <Route element={<MainLayout />}>
          
          {/* 1. Ai đăng nhập cũng vào được POS */}
          <Route element={<ProtectedRoute />}>
            {/* Mặc định vào trang Order */}
            <Route path="/" element={<Navigate to="/order" replace />} />
            <Route path="/order" element={<OrderPage />} />
          </Route>

          {/* 2. Chỉ Manager & Admin vào được Lịch sử & Menu */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']} />}>
             <Route path="/orderhistory" element={<OrderHistory />} />
             <Route path="/admin" element={<AdminMenu />} />
          </Route>

          {/* 3. (Ví dụ) Chỉ Admin vào được trang Nhân viên */}
          {/* <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
             <Route path="/staff" element={<StaffPage />} />
          </Route> 
          */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
            <Route path="/admin" element={<AdminMenu />} />
            {/* Thêm dòng này */}
            <Route path="/staff" element={<StaffPage />} /> 
          </Route>

        </Route>

        {/* Route không tồn tại -> Về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;