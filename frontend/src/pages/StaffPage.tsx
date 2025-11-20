// src/pages/StaffPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TrashIcon, UserPlusIcon, PencilIcon } from '@heroicons/react/24/outline';

// Type User
interface User {
    id: number;
    username: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export function StaffPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showStaffModal, setShowStaffModal] = useState(false);

    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE');

    useEffect(() => {
        fetchUsers();
    }, []);

    const getBadgeClass = (r: User['role']) => {
        if (r === 'ADMIN') return 'bg-red-100 text-red-800';
        if (r === 'MANAGER') return 'bg-blue-100 text-blue-800';
        return 'bg-green-100 text-green-800';
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('http://localhost:3000/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách nhân viên');
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setUsername('');
        setPassword('');
        setName('');
        setRole('EMPLOYEE');
        setShowStaffModal(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(
                'http://localhost:3000/users',
                { username, password, name, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Thêm nhân viên thành công!');
            fetchUsers();
            // Reset form and close
            setUsername('');
            setPassword('');
            setName('');
            setShowStaffModal(false);
        } catch (error) {
            console.error(error);
            let msg = 'Có lỗi xảy ra!';
            if (axios.isAxiosError(error)) msg = error.response?.data?.message || msg;
            toast.error(Array.isArray(msg) ? msg[0] : msg);
        }
    };

    const startEdit = (user: User) => {
        setEditingId(user.id);
        setUsername(user.username);
        setName(user.name || '');
        setRole(user.role);
        setPassword('');
        setShowStaffModal(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setUsername('');
        setPassword('');
        setName('');
        setRole('EMPLOYEE');
        setShowStaffModal(false);
    };

    type UpdateUserPayload = {
        name: string;
        role: User['role'];
        password?: string;
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            const token = localStorage.getItem('accessToken');
            const payload: UpdateUserPayload = { name, role };
            if (password) payload.password = password;
            await axios.patch(`http://localhost:3000/users/${editingId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Cập nhật nhân viên thành công');
            fetchUsers();
            cancelEdit();
        } catch (error) {
            console.error(error);
            toast.error('Cập nhật thất bại');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!globalThis.confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`http://localhost:3000/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Đã xóa nhân viên');
            setUsers((u) => u.filter((x) => x.id !== id));
        } catch (error) {
            console.error(error);
            toast.error('Xóa thất bại');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Nhân sự</h1>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center">
                        <UserPlusIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Danh sách nhân viên
                    </h2>
                    <div>
                        <button onClick={openCreateModal} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            + Thêm nhân viên
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeClass(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button onClick={() => startEdit(user)} className="text-indigo-600 hover:text-indigo-900" title="Sửa">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                {user.role !== 'ADMIN' && (
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900" title="Xóa">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit Staff */}
            {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => cancelEdit()} />
                    <div className="relative w-full max-w-md mx-4">
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</h3>

                            <form onSubmit={editingId ? handleUpdateUser : handleCreateUser} className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                                    <input
                                        id="username"
                                        name="username"
                                        required
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-1 block w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {editingId && <p className="text-xs text-gray-400 mt-1">Tên đăng nhập không thể thay đổi</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                    <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ tên</label>
                                    <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Vai trò</label>
                                    <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as 'EMPLOYEE' | 'MANAGER' | 'ADMIN')} className="mt-1 block w-full border rounded-md p-2">
                                        <option value="EMPLOYEE">Nhân viên</option>
                                        <option value="MANAGER">Quản lý</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                <div className="flex space-x-2">
                                    <button type="submit" className="flex-1 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                                        {editingId ? 'Cập nhật' : 'Tạo tài khoản'}
                                    </button>
                                    <button type="button" onClick={() => cancelEdit()} className="flex-0 px-4 bg-gray-200 rounded-md">
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}