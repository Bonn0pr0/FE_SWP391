import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { mockDashboardStats, mockBookings, mockRooms, mockChartData } from '@/lib/mockData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, TrendingUp, TrendingDown, Calendar, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedCampus, setSelectedCampus] = useState('all');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Tổng quan và báo cáo hệ thống</p>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="reports">Báo cáo chi tiết</TabsTrigger>
            <TabsTrigger value="history">Lịch sử booking</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top Used Rooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Top 5 phòng sử dụng cao nhất
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDashboardStats.topUsedRooms.map((room, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-sm">{room.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${room.usage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">{room.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Least Used Rooms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-warning" />
                    Top 5 phòng sử dụng thấp nhất
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDashboardStats.leastUsedRooms.map((room, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-sm">{room.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-warning rounded-full"
                              style={{ width: `${room.usage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">{room.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng sử dụng theo ngày</CardTitle>
                <CardDescription>Giờ đã sử dụng / Giờ khả dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockChartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="used" fill="hsl(var(--primary))" name="Đã sử dụng" />
                    <Bar dataKey="available" fill="hsl(var(--secondary))" name="Khả dụng" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {/* Utilization Rate Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tỷ lệ sử dụng theo thời gian</CardTitle>
                <CardDescription>Phần trăm thời gian phòng được sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockChartData.daily.map(d => ({ ...d, rate: (d.used / (d.used + d.available) * 100).toFixed(1) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" name="Tỷ lệ sử dụng (%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Heatmap sử dụng theo tuần</CardTitle>
                <CardDescription>Tỷ lệ sử dụng (%) theo giờ trong tuần</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-sm font-medium">Ngày</th>
                        {['8h', '9h', '10h', '11h', '13h', '14h', '15h', '16h'].map(hour => (
                          <th key={hour} className="text-center p-2 text-sm font-medium">{hour}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockChartData.heatmap.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-sm font-medium">{row.day}</td>
                          {['8h', '9h', '10h', '11h', '13h', '14h', '15h', '16h'].map(hour => {
                            const value = row[hour as keyof typeof row] as number;
                            const opacity = value / 100;
                            return (
                              <td key={hour} className="p-2">
                                <div
                                  className="h-10 rounded flex items-center justify-center text-xs font-semibold"
                                  style={{
                                    backgroundColor: `hsl(var(--primary) / ${opacity})`,
                                    color: opacity > 0.5 ? 'white' : 'hsl(var(--foreground))',
                                  }}
                                >
                                  {value}%
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Room Table */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết sử dụng theo phòng</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Campus</TableHead>
                      <TableHead>Sức chứa</TableHead>
                      <TableHead>Giờ khả dụng</TableHead>
                      <TableHead>Giờ đã đặt</TableHead>
                      <TableHead>Tỷ lệ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRooms.map(room => {
                      const totalHours = 192; // 8 hours/day * 24 days (example)
                      const usedHours = Math.floor(Math.random() * 100) + 50;
                      const rate = ((usedHours / totalHours) * 100).toFixed(1);
                      return (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>{room.type}</TableCell>
                          <TableCell>Campus {room.campus === 'campus1' ? '1' : '2'}</TableCell>
                          <TableCell>{room.capacity}</TableCell>
                          <TableCell>{totalHours}h</TableCell>
                          <TableCell>{usedHours}h</TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(rate) > 75 ? 'default' : parseFloat(rate) > 50 ? 'secondary' : 'outline'}>
                              {rate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lịch sử booking</CardTitle>
                    <CardDescription>Tất cả booking trong hệ thống</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">Xuất báo cáo</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Người đặt</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Mục đích</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBookings.map(booking => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                        <TableCell>{booking.userEmail}</TableCell>
                        <TableCell className="font-medium">{booking.roomName}</TableCell>
                        <TableCell>{new Date(booking.date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{booking.startTime}:00 - {booking.endTime}:00</TableCell>
                        <TableCell>{booking.purpose}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === 'Approved'
                                ? 'default'
                                : booking.status === 'Pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {booking.status === 'Approved' ? 'Đã duyệt' :
                             booking.status === 'Pending' ? 'Chờ duyệt' :
                             booking.status === 'Rejected' ? 'Từ chối' : 'Đã hủy'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
