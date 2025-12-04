import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingRequest {
  id: string;
  userEmail: string;
  userName: string;
  roomName: string;
  date: string;
  startTime: number;
  endTime: number;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  note?: string;
}

const initialBookingRequests: BookingRequest[] = [
  {
    id: 'BK001',
    userEmail: 'nguyenvana@fpt.edu.vn',
    userName: 'Nguyễn Văn A',
    roomName: 'Phòng họp A101',
    date: '2024-01-15',
    startTime: 8,
    endTime: 10,
    purpose: 'Họp nhóm dự án môn học',
    status: 'Pending',
    createdAt: '2024-01-10T09:00:00',
  },
  {
    id: 'BK002',
    userEmail: 'tranthib@fpt.edu.vn',
    userName: 'Trần Thị B',
    roomName: 'Phòng máy tính B201',
    date: '2024-01-16',
    startTime: 13,
    endTime: 15,
    purpose: 'Thực hành lập trình',
    status: 'Pending',
    createdAt: '2024-01-10T10:30:00',
  },
  {
    id: 'BK003',
    userEmail: 'levanc@fe.edu.vn',
    userName: 'Lê Văn C',
    roomName: 'Giảng đường C301',
    date: '2024-01-17',
    startTime: 9,
    endTime: 11,
    purpose: 'Tổ chức seminar khoa học',
    status: 'Pending',
    createdAt: '2024-01-11T08:00:00',
  },
  {
    id: 'BK004',
    userEmail: 'phamthid@fpt.edu.vn',
    userName: 'Phạm Thị D',
    roomName: 'Phòng họp A102',
    date: '2024-01-14',
    startTime: 14,
    endTime: 16,
    purpose: 'Phỏng vấn tuyển dụng CLB',
    status: 'Approved',
    createdAt: '2024-01-09T14:00:00',
  },
  {
    id: 'BK005',
    userEmail: 'hoangvane@fpt.edu.vn',
    userName: 'Hoàng Văn E',
    roomName: 'Sân bóng đá',
    date: '2024-01-18',
    startTime: 16,
    endTime: 18,
    purpose: 'Luyện tập đội bóng khoa',
    status: 'Rejected',
    createdAt: '2024-01-10T16:00:00',
    note: 'Sân đã được đặt cho sự kiện khác',
  },
];

export const BookingApprovalManager = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialBookingRequests);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredRequests = bookingRequests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  const pendingCount = bookingRequests.filter(r => r.status === 'Pending').length;

  const handleApprove = (booking: BookingRequest) => {
    setBookingRequests(prev =>
      prev.map(b =>
        b.id === booking.id ? { ...b, status: 'Approved' as const } : b
      )
    );
    toast({
      title: 'Đã duyệt yêu cầu',
      description: `Yêu cầu mượn phòng ${booking.roomName} của ${booking.userName} đã được duyệt.`,
    });
    setIsDetailOpen(false);
  };

  const handleReject = () => {
    if (!selectedBooking) return;
    
    setBookingRequests(prev =>
      prev.map(b =>
        b.id === selectedBooking.id 
          ? { ...b, status: 'Rejected' as const, note: rejectNote } 
          : b
      )
    );
    toast({
      title: 'Đã từ chối yêu cầu',
      description: `Yêu cầu mượn phòng ${selectedBooking.roomName} của ${selectedBooking.userName} đã bị từ chối.`,
      variant: 'destructive',
    });
    setIsRejectDialogOpen(false);
    setIsDetailOpen(false);
    setRejectNote('');
  };

  const openRejectDialog = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setIsRejectDialogOpen(true);
  };

  const viewDetail = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Chờ duyệt</Badge>;
      case 'Approved':
        return <Badge variant="default" className="gap-1 bg-success"><CheckCircle className="h-3 w-3" />Đã duyệt</Badge>;
      case 'Rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Quản lý yêu cầu mượn phòng
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-warning text-warning-foreground">
                  {pendingCount} chờ duyệt
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Duyệt hoặc từ chối các yêu cầu mượn phòng từ người dùng</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ duyệt</SelectItem>
              <SelectItem value="Approved">Đã duyệt</SelectItem>
              <SelectItem value="Rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
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
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Không có yêu cầu nào
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">{request.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-xs text-muted-foreground">{request.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{request.roomName}</TableCell>
                  <TableCell>{new Date(request.date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{request.startTime}:00 - {request.endTime}:00</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => viewDetail(request)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === 'Pending' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openRejectDialog(request)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu mượn phòng</DialogTitle>
            <DialogDescription>Thông tin chi tiết về yêu cầu #{selectedBooking?.id}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Người đặt</Label>
                  <p className="font-medium">{selectedBooking.userName}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.userEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng</Label>
                <p className="font-medium">{selectedBooking.roomName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ngày</Label>
                  <p className="font-medium">{new Date(selectedBooking.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Thời gian</Label>
                  <p className="font-medium">{selectedBooking.startTime}:00 - {selectedBooking.endTime}:00</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Mục đích</Label>
                <p className="font-medium">{selectedBooking.purpose}</p>
              </div>
              {selectedBooking.note && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="font-medium text-destructive">{selectedBooking.note}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Ngày tạo</Label>
                <p className="text-sm">{new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedBooking?.status === 'Pending' && (
              <div className="flex gap-2 w-full">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => openRejectDialog(selectedBooking)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
                <Button 
                  className="flex-1 bg-success hover:bg-success/90"
                  onClick={() => handleApprove(selectedBooking)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu mượn phòng này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-note">Lý do từ chối</Label>
              <Textarea
                id="reject-note"
                placeholder="Nhập lý do từ chối..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};