// src/components/layout/POSLayout.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowRightOnRectangleIcon, 
  ComputerDesktopIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

export function POSLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu các chức năng trong POS
  const tabs = [
    { name: 'Bán Hàng', path: '/order', icon: ComputerDesktopIcon },
    { name: 'Bếp / Bar', path: '/kitchen', icon: ClipboardDocumentListIcon }, // (Sẽ làm sau)
  ];

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* --- TOP BAR --- */}
      <header className="bg-gray-900 text-white shadow-md h-16 flex items-center justify-between px-4 flex-shrink-0">
        
        {/* Bên trái: Logo & Tabs */}
        <div className="flex items-center space-x-6">
          <div className="text-xl font-bold text-indigo-400">Drink POS</div>
          
          {/* Thanh chuyển Tab */}
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bên phải: Thông tin User & Logout */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-white">{user?.username}</div>
            <div className="text-xs text-gray-400">{user?.role}</div>
          </div>
          
          <button
            onClick={logout}
            className="p-2 rounded-full bg-gray-800 hover:bg-red-600 transition-colors text-gray-300 hover:text-white"
            title="Đăng xuất"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT (Full màn hình dưới) --- */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}