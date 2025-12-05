import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockChartData, mockRooms } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Báo cáo chi tiết</h1>
        <p className="text-muted-foreground mt-1">Phân tích tỷ lệ sử dụng và heatmap</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Utilization Rate Line Chart */}
          <div>
            <h3 className="font-semibold mb-4">Tỷ lệ sử dụng theo thời gian</h3>
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
          </div>

          {/* Heatmap */}
          <div>
            <h3 className="font-semibold mb-4">Heatmap sử dụng theo tuần</h3>
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
          </div>

          {/* Detailed Room Table */}
          <div>
            <h3 className="font-semibold mb-4">Chi tiết sử dụng theo phòng</h3>
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
                  const totalHours = 192;
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};