// frontend/src/features/staff/pages/StaffManagementPage.tsx - UNIFIED VERSION
import { useState, useEffect } from 'react';
import { usersAPI, apiClient, User } from '../../../lib/api';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../../../lib/utils';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

type RoleType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

interface Attendance {
  id: number;
  userId: number;
  checkIn: string;
  checkOut?: string;
  note?: string;
  user: {
    id: number;
    name?: string;
    username: string;
  };
}

export default function StaffManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'accounts' | 'attendance'>('accounts');

  // Accounts tab
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleType>('EMPLOYEE');

  // Attendance tab
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'accounts') {
      fetchUsers();
    } else {
      fetchAttendances();
    }
  }, [activeTab]);

  // === ACCOUNTS TAB FUNCTIONS ===
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

  // === ATTENDANCE TAB FUNCTIONS ===
  const fetchAttendances = async () => {
    setAttendanceLoading(true);
    try {
      const response = await apiClient.get('/hr/attendance');
      setAttendances(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu chấm công');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckIn = async (userId: number) => {
    try {
      await apiClient.post('/hr/attendance/check-in', { userId });
      toast.success('Check-in thành công');
      await fetchAttendances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCheckOut = async (userId: number) => {
    try {
      await apiClient.post('/hr/attendance/check-out', { userId });
      toast.success('Check-out thành công');
      await fetchAttendances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const todayAttendances = attendances.filter(att => {
    const attDate = new Date(att.checkIn);
    const today = new Date();
    return attDate.toDateString() === today.toDateString();
  });

  const roleOptions = [
    { value: 'EMPLOYEE', label: 'Nhân viên' },
    { value: 'MANAGER', label: 'Quản lý' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Quản lý Nhân sự</h1>
          <p className="text-gray-600 mt-2">Quản lý tài khoản và chấm công nhân viên</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'accounts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 inline mr-2" />
            Quản lý Tài khoản
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'attendance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClockIcon className="h-5 w-5 inline mr-2" />
            Chấm công
          </button>
        </div>

        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <>
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
          </>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Hôm nay</p>
                    <p className="text-2xl font-bold">{todayAttendances.length}</p>
                  </div>
                </div>
              </Card>
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Đã check-in</p>
                    <p className="text-2xl font-bold">
                      {todayAttendances.filter(a => !a.checkOut).length}
                    </p>
                  </div>
                </div>
              </Card>
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tổng chấm công</p>
                    <p className="text-2xl font-bold">{attendances.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Today's Attendance */}
            <Card padding="none">
              <CardHeader title="Chấm công hôm nay" />
              <div className="p-6">
                {attendanceLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải...</p>
                  </div>
                ) : todayAttendances.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có ai check-in hôm nay</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAttendances.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                            {att.user.name?.[0] || att.user.username[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{att.user.name || att.user.username}</p>
                            <p className="text-sm text-gray-600">
                              Check-in: {formatDate(att.checkIn)}
                            </p>
                            {att.checkOut && (
                              <p className="text-sm text-gray-600">
                                Check-out: {formatDate(att.checkOut)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {att.checkOut ? (
                            <Badge variant="success">Đã về</Badge>
                          ) : (
                            <>
                              <Badge variant="primary">Đang làm việc</Badge>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleCheckOut(att.user.id)}
                              >
                                Check-out
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
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