import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api';
import { formatDate } from '../../../lib/utils';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function HRManagementPage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const response = await apiClient.get('/hr/attendance');
      setAttendances(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const handleCheckIn = async (userId: number) => {
    setIsLoading(true);
    try {
      await apiClient.post('/hr/attendance/check-in', { userId });
      toast.success('Check-in thành công');
      await fetchAttendances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async (userId: number) => {
    setIsLoading(true);
    try {
      await apiClient.post('/hr/attendance/check-out', { userId });
      toast.success('Check-out thành công');
      await fetchAttendances();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const todayAttendances = attendances.filter(att => {
    const attDate = new Date(att.checkIn);
    const today = new Date();
    return attDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            Quản lý Nhân sự
          </h1>
          <p className="text-gray-600 mt-2">Chấm công và quản lý ca làm việc</p>
        </div>

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
            {todayAttendances.length === 0 ? (
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
                            isLoading={isLoading}
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
      </div>
    </div>
  );
}