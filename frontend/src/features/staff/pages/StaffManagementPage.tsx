// frontend/src/features/staff/pages/StaffManagementPage.tsx
import { useState, useEffect } from 'react';
import { usersAPI, User } from '../../../lib/api';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type RoleType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export default function StaffManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleType>('EMPLOYEE');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách nhân viên');
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUsername(user.username);
      setPassword('');
      setName(user.name || '');
      setRole(user.role);
    } else {
      setEditingUser(null);
      setUsername('');
      setPassword('');
      setName('');
      setRole('EMPLOYEE');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingUser) {
        const data: { name: string; role: RoleType; password?: string } = { name, role };
        if (password) data.password = password;

        await usersAPI.update(editingUser.id, data);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await usersAPI.create({ username, password, name, role });
        toast.success('Thêm nhân viên thành công');
      }

      await fetchUsers();
      closeModal();
    } catch (error: unknown) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Xóa nhân viên "${username}"?`)) return;

    try {
      await usersAPI.delete(id);
      toast.success('Xóa nhân viên thành công');
      await fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Xóa nhân viên thất bại');
    }
  };

  const getRoleBadge = (userRole: RoleType) => {
    const config = {
      ADMIN: { variant: 'danger' as const, label: 'Admin' },
      MANAGER: { variant: 'warning' as const, label: 'Quản lý' },
      EMPLOYEE: { variant: 'success' as const, label: 'Nhân viên' },
    };
    const { variant, label } = config[userRole];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Nhân viên' },
    { value: 'MANAGER', label: 'Quản lý' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div className="page-header">
          <h1 className="page-title">Quản lý Nhân sự</h1>
          <p className="text-gray-600 mt-2">Quản lý tài khoản và phân quyền nhân viên</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <UserGroupIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng nhân viên</p>
                <p className="text-xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card>

          {(['ADMIN', 'MANAGER', 'EMPLOYEE'] as RoleType[]).map((r) => (
            <Card key={r} padding="md">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    r === 'ADMIN' ? 'bg-red-100' : r === 'MANAGER' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}
                >
                  <ShieldCheckIcon
                    className={`h-5 w-5 ${
                      r === 'ADMIN' ? 'text-red-600' : r === 'MANAGER' ? 'text-yellow-600' : 'text-green-600'
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {r === 'ADMIN' ? 'Admin' : r === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{users.filter((u) => u.role === r).length}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Staff Table */}
        <Card padding="none">
          <CardHeader
            title="Danh sách nhân viên"
            subtitle={`${users.length} nhân viên`}
            action={
              <Button variant="primary" onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
                Thêm nhân viên
              </Button>
            }
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableEmpty message="Chưa có nhân viên nào" icon={<UserGroupIcon className="h-12 w-12 text-gray-300" />} />
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{user.username}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-700">{user.name || '-'}</div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nv01, manager01..."
            required
            disabled={!!editingUser}
            helperText={editingUser ? 'Không thể thay đổi tên đăng nhập' : undefined}
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required={!editingUser}
            helperText={editingUser ? 'Để trống nếu không muốn thay đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
          />

          <Input label="Họ tên" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />

          <Select
            label="Vai trò"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleType)}
            options={roleOptions}
            required
          />

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {editingUser ? 'Cập nhật' : 'Thêm'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}