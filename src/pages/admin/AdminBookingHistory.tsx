import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar, Check, Clock, Eye, Loader2, MapPin,
  RefreshCw, Search, Users, X, Building2, Ticket, Monitor, Presentation, Dumbbell, LayoutGrid
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // Import Badge nếu cần dùng trong Dialog

const API_BASE_URL = '/api/Booking';
const CURRENT_ADMIN_ID = 1;

// --- INTERFACES ---
interface BookingListItem {
  id: string | number;
  roomId: string;
  roomName: string;
  userId: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Feedbacked' | 'Conflict';
  purpose: string;
  createdAt: string;
  facilityType?: string;
  campusName?: string;
}

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

// --- HELPER: Lấy Icon và Màu nền giống hình mẫu ---
const getRoomStyle = (nameOrType: string = '') => {
    const t = nameOrType.toLowerCase();
    // Logic: Kiểm tra tên phòng để gán icon/màu sắc tương ứng
    if (t.includes('lab') || t.includes('computer') || t.includes('máy tính')) {
        return { icon: <Monitor className="w-5 h-5" />, color: 'bg-green-100 text-green-600' };
    }
    if (t.includes('hall') || t.includes('hội trường')) {
        return { icon: <LayoutGrid className="w-5 h-5" />, color: 'bg-slate-200 text-slate-600' };
    }
    if (t.includes('sân') || t.includes('sport') || t.includes('đá')) {
        return { icon: <Dumbbell className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' };
    }
    // Mặc định là phòng họp (Meeting Room) - Màu xanh dương
    return { icon: <Presentation className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' };
};

export const AdminBookingHistory = () => {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog States
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | number | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // --- DATA MAPPING ---
  const mapListResponseToFrontend = (apiData: any): BookingListItem => {
    const statusMap: Record<string, BookingListItem['status']> = {
      'approve': 'Approved', 'approved': 'Approved',
      'reject': 'Rejected', 'rejected': 'Rejected',
      'cancel': 'Cancelled', 'cancelled': 'Cancelled',
      'conflict': 'Conflict', 'feedbacked': 'Feedbacked',
    };
    
    const apiStatus = String(apiData.status || '').toLowerCase();
    let status: BookingListItem['status'] = 'Pending';
    
    if (apiStatus === 'conflict') status = 'Conflict';
    else status = statusMap[apiStatus] || 'Pending';
    
    return {
      id: apiData.bookingId,
      roomId: apiData.facilityCode,
      roomName: apiData.facilityCode || apiData.facilityName,
      userId: apiData.bookingCode,
      userEmail: apiData.fullName, // Hiển thị tên người dùng
      date: apiData.bookingDate,
      startTime: apiData.startTime,
      endTime: apiData.endTime,
      status,
      purpose: apiData.purpose,
      createdAt: apiData.createAt || new Date().toISOString(),
      facilityType: apiData.facilityType || 'General',
      campusName: apiData.campusName || 'FPT University' // Giả lập nếu API thiếu
    };
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/List`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBookings(data.map(mapListResponseToFrontend));
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- ACTIONS ---
  const updateBookingStatus = async (bookingId: string | number, newStatus: string, reason = '') => {
    try {
      const url = `${API_BASE_URL}/${bookingId}?currentUserId=${CURRENT_ADMIN_ID}`;
      const payloadStatus = newStatus.toLowerCase() === 'approve' ? 'Approved' : 'Rejected';
      const safeReason = payloadStatus === 'Approved' ? '' : reason;
      const payload = { status: payloadStatus, rejectionReason: safeReason };

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text() || 'Failed');

      const data = await response.json();
      const statusMap: Record<string, BookingListItem['status']> = { 'approved': 'Approved', 'rejected': 'Rejected' };
      const displayStatus = statusMap[data.status?.toLowerCase() || ''] || 'Pending';

      setBookings(prev => prev.map(b => (String(b.id) === String(bookingId) ? { ...b, status: displayStatus } : b)));
      
      toast({ title: 'Thành công', description: `Đã cập nhật trạng thái booking #${bookingId}.` });
      setStatusFilter('all');
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Cập nhật thất bại.', variant: 'destructive' });
    } finally {
      setIsRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const handleApprove = (id: string | number) => {
    const booking = bookings.find(b => b.id === id);
    if (booking?.status === 'Conflict') {
      if (!window.confirm('Duyệt booking này sẽ tự động từ chối các booking trùng lịch. Tiếp tục?')) return;
    }
    updateBookingStatus(id, 'approve');
  };

  const handleRejectConfirm = () => {
    if (!selectedBookingId || !rejectReason.trim()) {
        toast({ title: 'Lỗi', description: 'Vui lòng nhập lý do.', variant: 'destructive' });
        return;
    }
    updateBookingStatus(selectedBookingId, 'reject', rejectReason);
  };

  const handleViewDetail = async (id: number | string) => {
    setIsDetailDialogOpen(true);
    setIsDetailLoading(true);
    setBookingDetail(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Detail/${id}`);
      if (!response.ok) throw new Error('Failed');
      const data: BookingDetail = await response.json();
      setBookingDetail(data);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không tải được chi tiết.', variant: 'destructive' });
      setIsDetailDialogOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const formatTime = (t: string) => t?.split(':').slice(0, 2).join(':') || '';
  
  const filteredBookings = bookings.filter(b => {
      const matchesSearch = b.roomName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            b.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
  });

  // Render trạng thái dạng Dot giống hình
  const renderStatus = (statusStr: string) => {
    const s = statusStr?.toLowerCase() || 'pending';
    let colorClass = 'bg-slate-500';
    let textClass = 'text-slate-600';
    let label = s.charAt(0).toUpperCase() + s.slice(1); // Capitalize

    switch(s) {
        case 'approved': 
            colorClass = 'bg-green-500'; textClass = 'text-green-600 font-bold'; label = 'Approved'; break;
        case 'rejected':
            colorClass = 'bg-red-500'; textClass = 'text-red-600 font-bold'; label = 'Rejected'; break;
        case 'pending':
            colorClass = 'bg-orange-500'; textClass = 'text-orange-600 font-bold'; label = 'Pending'; break;
        case 'conflict':
            colorClass = 'bg-red-600'; textClass = 'text-red-700 font-bold'; label = 'Conflict'; break;
        case 'feedbacked':
            colorClass = 'bg-blue-500'; textClass = 'text-blue-600 font-bold'; label = 'Done'; break;
    }

    return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`}></span>
            <span className={`text-sm ${textClass}`}>{label}</span>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* --- HEADER: Gradient & Title giống hình --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
            Quản Lý Đặt Phòng
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Danh sách yêu cầu đặt phòng FPT University</p>
        </div>
        
        <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-slate-200 hover:bg-slate-100 w-10 h-10 text-slate-500 bg-white shadow-sm"
                onClick={fetchBookings} 
                title="Làm mới dữ liệu"
            >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        
        {/* Toolbar: Search & Filter */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-100">
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên phòng, người đặt..."
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg h-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg h-10">
                    <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                    <SelectItem value="conflict">Trùng lịch</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                  <TableHead className="pl-6 py-4 font-semibold text-slate-600">Icon</TableHead>
                  <TableHead className="font-semibold text-slate-600">Phòng & Khu vực</TableHead>
                  <TableHead className="font-semibold text-slate-600">Người đặt</TableHead>
                  <TableHead className="font-semibold text-slate-600">Thời gian</TableHead>
                  <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                  <TableHead className="text-right pr-6 font-semibold text-slate-600">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500"/></TableCell></TableRow>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => {
                    const style = getRoomStyle(b.roomName);
                    return (
                    <TableRow key={b.id} className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                      {/* Cột 1: Icon (Giống hình) */}
                      <TableCell className="pl-6 py-4">
                           <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${style.color}`}>
                                {style.icon}
                            </div>
                      </TableCell>
                      
                      {/* Cột 2: Phòng */}
                      <TableCell>
                          <div className="flex flex-col">
                              <span className="font-bold text-slate-700 text-sm">{b.roomName}</span>
                              <span className="text-xs text-slate-400 mt-0.5">{b.campusName}</span>
                          </div>
                      </TableCell>

                      {/* Cột 3: Người đặt */}
                      <TableCell>
                           <div className="flex flex-col">
                              <span className="font-semibold text-slate-700 text-sm">{b.userEmail}</span>
                              <span className="text-xs text-slate-400 mt-0.5">{b.userId}</span>
                          </div>
                      </TableCell>

                      {/* Cột 4: Thời gian */}
                      <TableCell>
                          <div className="flex flex-col text-sm">
                              <span className="text-slate-600 font-medium">{new Date(b.date).toLocaleDateString('vi-VN')}</span>
                              <span className="text-slate-500 text-xs">{formatTime(b.startTime)} - {formatTime(b.endTime)}</span>
                          </div>
                      </TableCell>

                      {/* Cột 5: Trạng thái (Dot) */}
                      <TableCell>
                         {renderStatus(b.status)}
                      </TableCell>

                      {/* Cột 6: Hành động */}
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {b.status === 'Pending' || b.status === 'Conflict' ? (
                            <>
                              <Button
                                size="icon" variant="ghost"
                                className="h-8 w-8 rounded-full text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all"
                                onClick={() => handleApprove(b.id)} title="Duyệt"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon" variant="ghost"
                                className="h-8 w-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                onClick={() => { setSelectedBookingId(b.id); setIsRejectDialogOpen(true); }} title="Từ chối"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : null}
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            onClick={() => handleViewDetail(b.id)} title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow><TableCell colSpan={6} className="py-12 text-center text-slate-400">Không tìm thấy booking nào</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* --- DIALOG TỪ CHỐI --- */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Từ chối yêu cầu</DialogTitle>
            <p className="text-sm text-slate-500">Vui lòng nhập lý do từ chối để thông báo cho người dùng.</p>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Nhập lý do..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              className="focus:ring-red-200 focus:border-red-400 bg-slate-50 border-slate-200"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleRejectConfirm}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG CHI TIẾT --- */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-xl border-none shadow-xl">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
             <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2 text-white">
                    <Ticket className="h-6 w-6"/> Chi tiết đặt phòng
                </DialogTitle>
             </DialogHeader>
             {bookingDetail && (
                 <div className="mt-4 flex items-center justify-between">
                     <div className="text-orange-100 text-sm font-mono tracking-wider">#{bookingDetail.bookingCode || bookingDetail.bookingId}</div>
                     <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-white/10">
                        {bookingDetail.status}
                     </div>
                 </div>
             )}
          </div>

          <div className="p-6 bg-white space-y-6">
            {isDetailLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            ) : bookingDetail ? (
                <>
                {/* Info Block 1: Room & Location */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">{bookingDetail.facilityName}</h4>
                        <p className="text-blue-600 text-sm font-medium mb-1">{bookingDetail.facilityType || 'General'}</p>
                        <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                             <MapPin className="h-4 w-4" /> {bookingDetail.campusName || 'FPT University'}
                             <span className="mx-1 text-slate-300">|</span>
                             <Users className="h-4 w-4" /> Sức chứa: {bookingDetail.capacity}
                        </p>
                    </div>
                </div>
                
                {/* Info Block 2: Time & User */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian</label>
                        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm">
                            <p className="font-medium text-slate-700 flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-orange-500"/> {new Date(bookingDetail.bookingDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="font-medium text-slate-700 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500"/> {formatTime(bookingDetail.startTime)} - {formatTime(bookingDetail.endTime)}
                            </p>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Người đặt</label>
                        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex items-center gap-3 h-[88px]">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                <Users className="h-5 w-5"/>
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 truncate" title={bookingDetail.fullName}>{bookingDetail.fullName}</p>
                                <p className="text-xs text-slate-500">Người dùng hệ thống</p>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mục đích</label>
                    <div className="p-4 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-100 relative">
                        <span className="absolute top-2 left-2 text-4xl text-slate-200 font-serif leading-none">"</span>
                        <p className="relative z-10 px-4">{bookingDetail.purpose}</p>
                    </div>
                </div>
                </>
            ) : <p className="text-center text-red-500 py-10">Không có dữ liệu chi tiết</p>}
          </div>
          
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};