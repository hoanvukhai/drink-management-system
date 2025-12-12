// frontend/src/components/layout/Sidebar.tsx - IMPROVED VERSION
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  FireIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  ShoppingBagIcon,
  BeakerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  href?: string;
  icon: any;
  roles: string[];
  children?: MenuItem[];
  badge?: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['operations']);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const navigation: MenuItem[] = [
    // 🏠 TRANG CHỦ
    {
      name: 'Trang chủ',
      href: '/main',
      icon: HomeIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    },

    // 🔥 VẬN HÀNH (Operations)
    {
      name: 'Vận hành',
      icon: FireIcon,
      roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      children: [
        {
          name: 'Phục vụ & Thu ngân',
          href: '/main',
          icon: ShoppingBagIcon,
          roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Bếp / Bar',
          href: '/kitchen',
          icon: FireIcon,
          roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
        {
          name: 'Lịch sử đơn hàng',
          href: '/orders',
          icon: ClipboardDocumentListIcon,
          roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
        },
      ],
    },

    // ⚙️ QUẢN LÝ (Management)
    {
      name: 'Quản lý',
      icon: Cog6ToothIcon,
      roles: ['ADMIN', 'MANAGER'],
      children: [
        {
          name: 'Menu & Sản phẩm',
          href: '/menu',
          icon: FolderIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
        {
          name: 'Khu vực & Bàn',
          href: '/zones',
          icon: HomeIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
        {
          name: 'Công thức',
          href: '/recipes',
          icon: BeakerIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
        {
          name: 'Nhân sự',
          href: '/staff',
          icon: UserGroupIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
      ],
    },

    // 📊 KHO & TÀI CHÍNH
    {
      name: 'Kho & Tài chính',
      icon: ChartBarIcon,
      roles: ['ADMIN', 'MANAGER'],
      children: [
        {
          name: 'Quản lý Kho',
          href: '/inventory',
          icon: BeakerIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
        {
          name: 'Lịch sử Kho',
          href: '/inventory-history',
          icon: ClipboardDocumentListIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
        {
          name: 'Chi phí',
          href: '/expenses',
          icon: ChartBarIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
        {
          name: 'Báo cáo',
          href: '/reports',
          icon: ChartBarIcon,
          roles: ['ADMIN', 'MANAGER'],
        },
      ],
    },

    // 👥 CHẤM CÔNG
    {
      name: 'Chấm công',
      href: '/hr',
      icon: UserGroupIcon,
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  const filteredNav = navigation.filter((item) =>
    user && item.roles?.includes(user.role)
  );

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.name);
    const Icon = item.icon;

    if (hasChildren) {
      // Group with dropdown
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleGroup(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white ${
              level > 0 ? 'pl-8' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </span>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children
                ?.filter(child => user && child.roles?.includes(user.role))
                .map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Single link
    return (
      <NavLink
        key={item.href}
        to={item.href!}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            level > 0 ? 'pl-11' : ''
          } ${
            isActive
              ? 'bg-orange-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`
        }
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium text-sm">{item.name}</span>
        {item.badge && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

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
          {filteredNav.map((item) => renderMenuItem(item))}
        </nav>

        {/* Logout */}
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