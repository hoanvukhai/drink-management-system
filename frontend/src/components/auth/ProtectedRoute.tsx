// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="p-10 text-center">Đang tải...</div>;

  // 1. Chưa đăng nhập -> Đá về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Sai quyền -> Đá về trang chủ (hoặc trang báo lỗi)
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    alert('Bạn không có quyền truy cập!');
    return <Navigate to="/order" replace />;
  }

  // 3. Hợp lệ -> Hiển thị nội dung bên trong (Outlet)
  return <Outlet />;
}