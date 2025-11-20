// src/pages/login.tsx
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [username, setUsername] = useState(''); // <-- State username
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Gọi API Login
      const res = await axios.post('http://localhost:3000/auth/login', {
        username, // Gửi username
        password,
      });
      toast.success('Đăng nhập thành công!');
      login(res.data.accessToken);
    } catch (error) {
  console.error(error);

  let msg = 'Có lỗi xảy ra!';

  if (axios.isAxiosError(error)) {
    msg = error.response?.data?.message || msg;
  }

  toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-gray-100 px-4 py-16">
      <div className="w-full max-w-2xl rounded-3xl bg-indigo-50 p-10 shadow-2xl mx-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">DS</div>
            <div className="text-left">
              <h2 className="text-3xl font-extrabold text-gray-900">Drink POS</h2>
              <p className="mt-1 text-sm text-gray-600">Hệ thống quản lý cửa hàng</p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="admin, nv01..."
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((s) => !s)}
                className="mr-2"
                aria-label="Ghi nhớ đăng nhập"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <button type="button" onClick={() => toast('Liên hệ admin để đặt lại mật khẩu')} className="text-sm text-indigo-600 hover:underline">
              Quên mật khẩu?
            </button>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <span>Liên hệ admin để lấy tài khoản demo.</span>
        </div>
      </div>
    </div>
    </div>
  );
}