// frontend/src/features/auth/pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import toast, { Toaster } from 'react-hot-toast';
import { UserIcon, LockClosedIcon, FireIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      toast.success('Đăng nhập thành công!');
      login(response.data.accessToken);
    } catch (error) {
      console.error(error);
      toast.error('Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <FireIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drink POS</h1>
          <p className="text-gray-600">Hệ thống quản lý cửa hàng thức uống</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Đăng nhập</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tên đăng nhập"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, nv01..."
              required
              disabled={isLoading}
              autoFocus
              leftIcon={<UserIcon className="h-5 w-5" />}
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              leftIcon={<LockClosedIcon className="h-5 w-5" />}
            />

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
              </label>

              <button
                type="button"
                onClick={() => toast('Liên hệ admin để đặt lại mật khẩu')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Đăng nhập
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Liên hệ admin để lấy tài khoản demo
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2024 Drink POS. All rights reserved.
        </p>
      </div>
    </div>
  );
}