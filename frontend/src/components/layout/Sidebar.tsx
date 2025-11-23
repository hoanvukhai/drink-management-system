// frontend/src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  MapPinIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: 'Sơ đồ bàn',
      href: '/tables',
      icon: MapPinIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Lịch sử đơn hàng',
      href: '/orders',
      icon: ClipboardDocumentListIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Quản lý Menu',
      href: '/menu',
      icon: FolderIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Nhân sự',
      href: '/staff',
      icon: UserGroupIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  const filteredNav = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
              <FireIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Drink POS</h2>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.username}</p>
              <p className="text-xs text-gray-400">
                {user?.role === 'ADMIN'
                  ? 'Quản trị viên'
                  : user?.role === 'MANAGER'
                  ? 'Quản lý'
                  : 'Nhân viên'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}