import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Eye, Loader2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// --- Cấu hình API ---
// Nếu bạn chạy qua Proxy (Vite) thì để tương đối, nếu không thì điền full URL https://localhost:44338/api/Booking
const API_BASE_URL = '/api/Booking'; 

const CURRENT_ADMIN_ID = 1;

// Interface cho danh sách (Gọn nhẹ)
interface BookingListItem {
  id: string | number;
  roomId: string;
  roomName: string;
  userId: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  purpose: string;
  createdAt: string;
}

// Interface cho Chi tiết
interface BookingDetail {
  bookingId: number;
  bookingCode: string;
  status: string;
  createAt: string;
  fullName: string;
  facilityName: string;
  facilityType: string;
  campusName: string;
  capacity: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

export const AdminBookingHistory = () => {
  const [statusFilter, setStatusFilter] = useState('all'); // Giữ lại nếu bạn muốn dùng filter sau này
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  
  // State quản lý danh sách
  const [isLoading, setIsLoading] = useState(true);
  
  // State quản lý chi tiết
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // State quản lý từ chối
  const [rejectReason, setRejectReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | number | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // --- 1. Fetch Danh sách (List) ---
  const mapListResponseToFrontend = (apiData: any): BookingListItem => {
    let status: any = 'Pending';
    const apiStatus = apiData.status?.toLowerCase();
    if (apiStatus === 'approve' || apiStatus === 'approved') status = 'Approved';
    else if (apiStatus === 'reject' || apiStatus === 'rejected') status = 'Rejected';
    else if (apiStatus === 'cancel' || apiStatus === 'cancelled') status = 'Cancelled';
    
    return {
      id: apiData.bookingId,
      roomId: apiData.facilityCode,
      roomName: apiData.facilityCode || apiData.facilityName,
      userId: apiData.bookingCode,
      userEmail: apiData.fullName,
      date: apiData.bookingDate,
      startTime: apiData.startTime,
      endTime: apiData.endTime,
      status: status,
      purpose: apiData.purpose,
      createdAt: apiData.createAt || new Date().toISOString(),
    };
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/List`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.map(mapListResponseToFrontend));
    } catch (error) {
      console.error("Error fetching list:", error);
      toast({ title: "Lỗi", description: "Không thể tải danh sách.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- 2. Fetch Chi tiết (Detail) ---
  const handleViewDetail = async (id: number | string) => {
    setIsDetailDialogOpen(true);
    setIsDetailLoading(true);
    setBookingDetail(null);

    try {
      const response = await fetch(`${API_BASE_URL}/Detail/${id}`);
      if (!response.ok) throw new Error('Failed to fetch detail');
      
      const data: BookingDetail = await response.json();
      setBookingDetail(data);
    } catch (error) {
      console.error("Error fetching detail:", error);
      toast({ title: "Lỗi", description: "Không thể tải chi tiết booking.", variant: "destructive" });
      setIsDetailDialogOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // --- 3. Xử lý Duyệt/Từ chối (Đã sửa lỗi RejectionReason Required) ---
  const updateBookingStatus = async (bookingId: string | number, newStatus: string, reason: string = "") => {
    try {
      // 1. URL setup
      const url = `${API_BASE_URL}/${bookingId}?currentUserId=${CURRENT_ADMIN_ID}`;

      // 2. Body Payload
      const payloadStatus = newStatus === 'approve' ? 'approved' : 'rejected';

      // SỬA LỖI TẠI ĐÂY:
      // Backend yêu cầu trường này bắt buộc (Required).
      // Không được gửi null. Nếu approve (không có lý do) thì gửi chuỗi rỗng "".
      const safeReason = reason ? reason : ""; 

      const payload = {
        status: payloadStatus,
        rejectionReason: safeReason 
      };

      const response = await fetch(url, {
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json', 
          'accept': '*/*' 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(errorText || 'Failed to update');
      }

      const data = await response.json();

      // 3. Cập nhật UI
      let displayStatus: any = 'Pending';
      const returnedStatus = data.status?.toLowerCase();
      
      if (returnedStatus === 'approved') displayStatus = 'Approved';
      else if (returnedStatus === 'rejected') displayStatus = 'Rejected';

      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: displayStatus } : b)));
      
      if (bookingDetail && bookingDetail.bookingId === Number(bookingId)) {
          setBookingDetail({ ...bookingDetail, status: data.status });
      }

      toast({ 
        title: "Thành công", 
        description: `Đã cập nhật trạng thái booking #${bookingId}.` 
      });

    } catch (error) {
      console.error("Update failed:", error);
      toast({ 
        title: "Lỗi cập nhật", 
        description: "Lỗi Validation từ Server hoặc lỗi kết nối.", 
        variant: "destructive" 
      });
    } finally {
      setIsRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const handleApprove = (id: string | number) => updateBookingStatus(id, 'approve');
  
  const handleRejectConfirm = () => {
    if (selectedBookingId && rejectReason.trim()) {
      updateBookingStatus(selectedBookingId, 'reject', rejectReason);
    } else {
        // Nếu muốn bắt buộc nhập lý do mới cho reject thì giữ check này
        toast({ title: "Lỗi", description: "Vui lòng nhập lý do từ chối", variant: "destructive" });
    }
  };

  const openRejectDialog = (id: string | number) => {
    setSelectedBookingId(id);
    setIsRejectDialogOpen(true);
  };

  // --- Helpers ---
  const formatTime = (t: string) => t?.split(':').slice(0, 2).join(':') || "";
  const filteredBookings = bookings.filter(b => statusFilter === 'all' || b.status.toLowerCase() === statusFilter);

  const renderStatusBadge = (statusStr: string) => {
    const s = statusStr?.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let label = "Chờ duyệt";

    if (s === 'approve' || s === 'approved') { variant = 'default'; label = 'Đã duyệt'; }
    else if (s === 'reject' || s === 'rejected') { variant = 'destructive'; label = 'Từ chối'; }
    else if (s === 'cancel' || s === 'cancelled') { variant = 'outline'; label = 'Đã hủy'; }

    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lịch sử booking</h1>
        <p className="text-muted-foreground mt-1">Quản lý yêu cầu đặt phòng</p>
      </div>

      <Card>
        <CardHeader>
           <div className="flex justify-end mb-2">
             <Button variant="outline" size="sm" onClick={fetchBookings} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Làm mới danh sách"}
             </Button>
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
                <TableHead>Thao tác</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Đang tải...</TableCell></TableRow>
              ) : filteredBookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">#{b.id}</TableCell>
                  <TableCell>{b.userEmail}</TableCell>
                  <TableCell className="font-medium">{b.roomName}</TableCell>
                  <TableCell>{new Date(b.date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{formatTime(b.startTime)} - {formatTime(b.endTime)}</TableCell>
                  <TableCell>{renderStatusBadge(b.status)}</TableCell>
                  <TableCell>
                    {b.status === 'Pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 px-2" onClick={() => handleApprove(b.id)}><Check className="w-3 h-3" /></Button>
                        <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => openRejectDialog(b.id)}><X className="w-3 h-3" /></Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => handleViewDetail(b.id)}>
                      <Eye className="w-3 h-3 mr-1" /> Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Reject Dialog --- */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Từ chối yêu cầu</DialogTitle></DialogHeader>
            <Textarea placeholder="Lý do từ chối..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Hủy</Button>
                <Button variant="destructive" onClick={handleRejectConfirm}>Xác nhận</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- DETAIL DIALOG --- */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết Đặt phòng</DialogTitle>
            <DialogDescription>Thông tin chi tiết được lấy từ hệ thống.</DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
             <div className="flex flex-col items-center justify-center py-10 space-y-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-muted-foreground">Đang tải thông tin chi tiết...</p>
             </div>
          ) : bookingDetail ? (
            <div className="grid gap-6 py-4">
              
              {/* Header Info */}
              <div className="flex items-start justify-between border-b pb-4">
                 <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                       {bookingDetail.facilityName}
                       <Badge variant="outline">{bookingDetail.facilityType}</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                       <MapPin className="w-3 h-3" /> {bookingDetail.campusName}
                    </p>
                 </div>
                 <div className="text-right">
                    <div className="mb-1">{renderStatusBadge(bookingDetail.status)}</div>
                    <p className="text-xs font-mono text-muted-foreground">Ref: {bookingDetail.bookingCode}</p>
                 </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-6">
                 
                 {/* Cột Trái */}
                 <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Thời gian</h4>
                        <div className="bg-muted/50 p-3 rounded-md space-y-2">
                           <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{new Date(bookingDetail.bookingDate).toLocaleDateString('vi-VN')}</span>
                           </div>
                           <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{formatTime(bookingDetail.startTime)} - {formatTime(bookingDetail.endTime)}</span>
                           </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Người yêu cầu</h4>
                        <div className="flex items-center gap-3 p-3 border rounded-md">
                           <div className="bg-primary/10 p-2 rounded-full">
                              <Users className="w-4 h-4 text-primary" />
                           </div>
                           <div>
                              <p className="font-medium text-sm">{bookingDetail.fullName}</p>
                              <p className="text-xs text-muted-foreground">ID: {bookingDetail.bookingCode}</p>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Cột Phải */}
                 <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Thông tin phòng</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                           <div className="p-2 bg-muted/30 rounded border text-center">
                              <span className="block text-xs text-muted-foreground">Sức chứa</span>
                              <span className="font-bold text-lg">{bookingDetail.capacity}</span>
                           </div>
                           <div className="p-2 bg-muted/30 rounded border text-center">
                               <span className="block text-xs text-muted-foreground">Loại</span>
                               <span className="font-medium truncate">{bookingDetail.facilityType}</span>
                           </div>
                        </div>
                    </div>

                    <div>
                       <h4 className="text-sm font-medium mb-2 text-muted-foreground">Mục đích sử dụng</h4>
                       <div className="p-3 bg-muted/30 rounded-md border min-h-[80px]">
                          <p className="text-sm italic">"{bookingDetail.purpose}"</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Footer Info */}
              <div className="text-xs text-muted-foreground text-center border-t pt-4">
                 Ngày tạo yêu cầu: {new Date(bookingDetail.createAt).toLocaleString('vi-VN')}
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-destructive">
               Không tìm thấy dữ liệu booking.
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};