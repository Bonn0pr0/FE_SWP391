import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockRooms, mockBookings } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, TrendingUp } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  campus: 'campus1' | 'campus2';
}

const UserDashboard = () => {
  const { user, updateCampus } = useAuth();
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const predefinedSlots = [
    { id: 1, start: '07:30:00', end: '09:00:00', label: '07:30 - 09:00' },
    { id: 2, start: '09:10:00', end: '10:40:00', label: '09:10 - 10:40' },
    { id: 3, start: '10:50:00', end: '12:20:00', label: '10:50 - 12:20' },
    { id: 4, start: '13:00:00', end: '14:30:00', label: '13:00 - 14:30' },
    { id: 5, start: '14:40:00', end: '16:10:00', label: '14:40 - 16:10' },
  ];

  const [selectedSlotId, setSelectedSlotId] = useState<number>(1);
  const [selectedStartTime, setSelectedStartTime] = useState<string>(predefinedSlots[0].start);
  const [selectedEndTime, setSelectedEndTime] = useState<string>(predefinedSlots[0].end);

  // Filter bookings for current user
  const userBookings = mockBookings.filter(b => b.userEmail === user?.email);

  const handleCampusChange = (campus: 'campus1' | 'campus2') => {
    // Update campus in auth context so selection persists
    updateCampus(campus);
  };

  // timeSlots replaced by predefinedSlots (fixed ranges)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Chào mừng, {user?.email.split('@')[0]}</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'student' ? 'Sinh viên' : 'Giảng viên'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="campus" className="text-sm">Chọn Campus</Label>
              <Select value={user?.campus || 'campus1'} onValueChange={(value: 'campus1' | 'campus2') => handleCampusChange(value)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campus1">Campus 1 - Công nghệ cao</SelectItem>
                  <SelectItem value="campus2">Campus 2 - Nhà văn hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="gradient-purple text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đặt phòng đang hoạt động</CardTitle>
              <Calendar className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userBookings.filter(b => b.status === 'Approved' || b.status === 'Pending').length}</div>
            </CardContent>
          </Card>

          <Card className="gradient-blue text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giờ đã đặt</CardTitle>
              <Clock className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userBookings.reduce((acc, b) => acc + (b.endTime - b.startTime), 0)} giờ
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-pink text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phòng khả dụng</CardTitle>
              <MapPin className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mockRooms.filter(r => r.campus === user?.campus).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Availability Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Phòng khả dụng hôm nay</CardTitle>
            <CardDescription>Campus {user?.campus === 'campus1' ? '1 - Công nghệ cao' : '2 - Nhà văn hóa'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockRooms
                .filter(room => room.campus === user?.campus)
                .map((room, idx) => {
                  const gradients = ['gradient-purple', 'gradient-blue', 'gradient-pink', 'gradient-orange', 'gradient-green'];
                  const gradient = gradients[idx % gradients.length];
                  
                  return (
                    <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all hover:scale-105">
                      <div className={`h-2 ${gradient}`} />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{room.name}</CardTitle>
                            <CardDescription>{room.type}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="font-semibold">{room.capacity} chỗ</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                            <span className="text-muted-foreground">Khả dụng: 8h-12h, 14h-17h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-destructive" />
                            <span className="text-muted-foreground">Đã đặt: 9h-11h, 15h-16h</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => setSelectedRoom(room)}
                              >
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>{room.name}</DialogTitle>
                                <DialogDescription>
                                  {room.type} - Sức chứa: {room.capacity} người
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="booking-date">Chọn ngày</Label>
                                  <input 
                                    id="booking-date"
                                    type="date" 
                                    className="w-full px-3 py-2 border border-input rounded-md"
                                    defaultValue={selectedDate}
                                    aria-label="Chọn ngày đặt phòng"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Chọn khung giờ: </Label>
                                  <div className="grid grid-cols-1 gap-2">
                                    {predefinedSlots.map(slot => (
                                      <Button
                                        key={slot.id}
                                        className="w-full"
                                        variant={selectedSlotId === slot.id ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                          setSelectedSlotId(slot.id);
                                          setSelectedStartTime(slot.start);
                                          setSelectedEndTime(slot.end);
                                        }}
                                      >
                                        {slot.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Mục đích sử dụng</Label>
                                  <textarea 
                                    className="w-full px-3 py-2 border border-input rounded-md min-h-[80px]"
                                    placeholder="Nhập mục đích sử dụng phòng..."
                                  />
                                </div>
                                <Button className="w-full">
                                  Đặt phòng
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        
      </main>
    </div>
  );
};

export default UserDashboard;
