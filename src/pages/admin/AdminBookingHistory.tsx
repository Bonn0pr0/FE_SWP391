import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { mockBookings, mockRooms } from '@/lib/mockData';
import { Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingWithActions {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userEmail: string;
  date: string;
  startTime: number;
  endTime: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  purpose: string;
  createdAt: string;
}

export const AdminBookingHistory = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState<BookingWithActions[]>(mockBookings as BookingWithActions[]);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithActions | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleApprove = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'Approved' as const } : b))
    );
    toast({
      title: "Đã duyệt yêu cầu",
      description: "Yêu cầu đặt phòng đã được duyệt thành công.",
    });
  };

  const handleReject = (bookingId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối.",
        variant: "destructive",
      });
      return;
    }
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'Rejected' as const } : b))
    );
    setIsRejectDialogOpen(false);
    setRejectReason('');
    toast({
      title: "Đã từ chối yêu cầu",
      description: "Yêu cầu đặt phòng đã bị từ chối.",
    });
  };

  const openRejectDialog = (booking: BookingWithActions) => {
    setSelectedBooking(booking);
    setIsRejectDialogOpen(true);
  };

  const openDetailDialog = (booking: BookingWithActions) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status.toLowerCase() === statusFilter;
  });

  const getRoomDetails = (roomName: string) => {
    return mockRooms.find(r => r.name === roomName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch sử booking</h1>
        <p className="text-muted-foreground mt-1">Quản lý và duyệt/từ chối các yêu cầu đặt phòng</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách yêu cầu</CardTitle>
              <CardDescription>Tất cả các yêu cầu đặt phòng</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <TableHead>Hoạt động</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map(booking => (
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
                  <TableCell>
                    {booking.status === 'Pending' ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 px-2"
                          onClick={() => handleApprove(booking.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2"
                          onClick={() => openRejectDialog(booking)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => openDetailDialog(booking)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu đặt phòng này.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Phòng: <span className="font-medium text-foreground">{selectedBooking?.roomName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Người đặt: <span className="font-medium text-foreground">{selectedBooking?.userEmail}</span>
              </p>
            </div>
            <Textarea
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={() => selectedBooking && handleReject(selectedBooking.id)}>
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt phòng</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã booking</p>
                  <p className="font-medium font-mono">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge
                    variant={
                      selectedBooking.status === 'Approved'
                        ? 'default'
                        : selectedBooking.status === 'Pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {selectedBooking.status === 'Approved' ? 'Đã duyệt' :
                     selectedBooking.status === 'Pending' ? 'Chờ duyệt' :
                     selectedBooking.status === 'Rejected' ? 'Từ chối' : 'Đã hủy'}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Thông tin người đặt</h4>
                <p className="text-sm">{selectedBooking.userEmail}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Thông tin phòng</h4>
                {(() => {
                  const room = getRoomDetails(selectedBooking.roomName);
                  return room ? (
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Tên phòng:</span> {room.name}</p>
                      <p><span className="text-muted-foreground">Loại:</span> {room.type}</p>
                      <p><span className="text-muted-foreground">Campus:</span> Campus {room.campus === 'campus1' ? '1' : '2'}</p>
                      <p><span className="text-muted-foreground">Sức chứa:</span> {room.capacity} người</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không tìm thấy thông tin phòng</p>
                  );
                })()}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Thông tin đặt phòng</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Ngày:</span> {new Date(selectedBooking.date).toLocaleDateString('vi-VN')}</p>
                  <p><span className="text-muted-foreground">Thời gian:</span> {selectedBooking.startTime}:00 - {selectedBooking.endTime}:00</p>
                  <p><span className="text-muted-foreground">Mục đích:</span> {selectedBooking.purpose}</p>
                  <p><span className="text-muted-foreground">Ngày tạo:</span> {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};