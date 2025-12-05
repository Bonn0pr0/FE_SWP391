import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDashboardStats, mockChartData } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground mt-1">Thống kê phòng sử dụng cao và thấp nhất</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Used Rooms */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <TrendingUp className="h-5 w-5 text-success" />
                Top 5 phòng sử dụng cao nhất
              </h3>
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
            </div>

            {/* Least Used Rooms */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <TrendingDown className="h-5 w-5 text-warning" />
                Top 5 phòng sử dụng thấp nhất
              </h3>
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
            </div>
          </div>

          {/* Usage Trend Chart */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Xu hướng sử dụng theo ngày</h3>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};