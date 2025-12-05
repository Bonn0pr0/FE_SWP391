import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDashboardStats } from '@/lib/mockData';
import { Building2, TrendingUp, Calendar, XCircle } from 'lucide-react';

export const AdminDashboardStats = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedCampus, setSelectedCampus] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Thống kê tổng quan hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="semester">Học kỳ hiện tại</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCampus} onValueChange={setSelectedCampus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả campus</SelectItem>
            <SelectItem value="campus1">Campus 1 - Công nghệ cao</SelectItem>
            <SelectItem value="campus2">Campus 2 - Nhà văn hóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-purple text-white border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
            <Building2 className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockDashboardStats.totalRooms}</div>
            <p className="text-xs opacity-80 mt-1">Trên tất cả campus</p>
          </CardContent>
        </Card>

        <Card className="gradient-green text-white border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ sử dụng 7 ngày</CardTitle>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockDashboardStats.utilizationRate7Days}%</div>
            <p className="text-xs opacity-80 mt-1">+5.2% so với tuần trước</p>
          </CardContent>
        </Card>

        <Card className="gradient-blue text-white border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking đã duyệt</CardTitle>
            <Calendar className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockDashboardStats.totalApprovedBookings}</div>
            <p className="text-xs opacity-80 mt-1">Trong {timeRange === '7days' ? '7' : '30'} ngày</p>
          </CardContent>
        </Card>

        <Card className="gradient-pink text-white border-0 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking bị từ chối</CardTitle>
            <XCircle className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockDashboardStats.rejectedBookings}</div>
            <p className="text-xs opacity-80 mt-1">-2 so với kỳ trước</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};