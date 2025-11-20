// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  ShoppingCartIcon,
  FireIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon, // sign-out icon
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Sidebar({ isOpen, onClose }: Readonly<{ isOpen?: boolean; onClose?: () => void }>) {
  const { user, logout } = useAuth();

  const navigation = [
    { 
      name: 'Bán Hàng (POS)', 
      href: '/order', 
      icon: ShoppingCartIcon, 
      allowedRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    { 
      name: 'Lịch sử đơn hàng', 
      href: '/orderhistory', 
      icon: ClockIcon,
      allowedRoles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
    },
    { 
      name: 'Quản lý Menu', 
      href: '/admin', 
      icon: ArchiveBoxIcon,
      allowedRoles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Nhân viên', 
      href: '/staff', 
      icon: UserGroupIcon,
      allowedRoles: ['ADMIN'] 
    },
  ];

  const filteredNavigation = navigation.filter((item) => 
    user && item.allowedRoles.includes(user.role)
  );

  return (
    <>
      {/* Mobile off-canvas panel */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className={`absolute left-0 top-0 bottom-0 w-full sm:w-80 bg-gray-900 text-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
          <div className="relative">
            <div className="flex h-16 items-center px-4 justify-start bg-gray-900">
              <FireIcon className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-semibold">Drink POS</span>
            </div>
            {/* Close button for mobile off-canvas */}
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-2 top-2 p-1 rounded-md text-gray-300 hover:text-white hover:bg-gray-800/50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-800">
            Xin chào, <span className="text-gray-300 font-medium">{user?.username}</span> <br/>
            <span className="text-indigo-400 uppercase font-bold" style={{fontSize: '0.65rem'}}>
              {user?.role}
            </span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <NavLink key={item.name} to={item.href} className={({ isActive }) => classNames(isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white', 'group flex items-center rounded-md px-3 py-2 text-sm font-medium')}
                onClick={onClose}
              >
                <item.icon className="h-6 w-6 flex-shrink-0 mr-3" />
                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-gray-800 p-2">
            <button onClick={() => { logout(); onClose?.(); }} className="w-full group flex items-center rounded-md px-2 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
              <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Desktop/static sidebar */}
      <div className="hidden md:flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out w-64 md:w-64 lg:w-72 overflow-hidden h-screen sticky top-0">
        <div className="flex h-16 flex-shrink-0 items-center px-4 justify-start bg-gray-900 z-10 shadow-sm">
          <FireIcon className="h-8 w-8 text-indigo-400 flex-shrink-0" />
          <span className="ml-2 text-xl font-semibold whitespace-nowrap">Drink POS</span>
        </div>
        <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-800">
          Xin chào, <span className="text-gray-300 font-medium">{user?.username}</span> <br/>
          <span className="text-indigo-400 uppercase font-bold" style={{fontSize: '0.65rem'}}>
            {user?.role}
          </span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors justify-start'
                  )
                }
              >
                <item.icon className="h-6 w-6 flex-shrink-0 md:mr-3" />
                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-800 p-2">
          <button
            onClick={logout}
            className="w-full group flex items-center rounded-md px-2 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors justify-start"
            title="Đăng xuất"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6 flex-shrink-0 md:mr-3" />
            <span className="whitespace-nowrap">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
}