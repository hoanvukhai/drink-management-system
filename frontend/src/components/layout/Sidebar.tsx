// frontend/src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  FireIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const navigation = [
    // 🔥 2 TABS CHÍNH
    {
      name: '🍽️ Phục vụ & Thu ngân',
      href: '/main',
      icon: FireIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: '☕ Bếp / Bar',
      href: '/kitchen',
      icon: FireIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    
    { divider: true },
    
    // Others
    {
      name: 'Lịch sử đơn hàng',
      href: '/orders',
      icon: ClipboardDocumentListIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    
    { divider: true },
    
    // Admin & Manager
    {
      name: 'Quản lý Menu',
      href: '/menu',
      icon: FolderIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Khu vực & Bàn',
      href: '/zones',
      icon: MapPinIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Nhân sự',
      href: '/staff',
      icon: UserGroupIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Công thức',
      href: '/recipes',
      icon: ClipboardDocumentListIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Tồn kho',
      href: '/inventory',
      icon: FolderIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Nhân sự',
      href: '/hr',
      icon: UserGroupIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Quản lý Chi phí',
      href: '/expenses',
      icon: FolderIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Báo cáo',
      href: '/reports',
      icon: ClipboardDocumentListIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      name: 'Lịch sử Tồn kho',
      href: '/inventory-history',
      icon: FolderIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  const filteredNav = navigation.filter((item) =>
    item.divider || (user && item.roles?.includes(user.role))
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-600 to-red-600">
              ☕
            </div>
            <div>
              <h2 className="font-bold text-lg">Cafe POS</h2>
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

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item, index) => {
            if (item.divider) {
              return <div key={`divider-${index}`} className="h-px bg-gray-800 my-2" />;
            }
            return (
              <NavLink
                key={item.href}
                to={item.href!}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

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