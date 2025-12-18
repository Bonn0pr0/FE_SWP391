import * as React from 'react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  History,
  Building2,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const Information = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [active, setActive] = useState<'history' | 'report'>('history');
  const [bookings, setBookings] = useState<any[]>([]);
  const userBookings = bookings;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [reviewDesc, setReviewDesc] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<any>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState<any>(null);
  const [checkComment, setCheckComment] = useState('');
  const [checkImages, setCheckImages] = useState<File[]>([]);
  const [stats, setStats] = useState<any>({
    totalBookings: 0,
    successRate: 0,
    mostBookedFacilityType: 'N/A',
  });

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const userId = (user as any)?.userId;
        if (!userId) return;
        const res = await fetch(`/api/Booking/User/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((b: any) => {
              const normalizeTime = (t: any) => {
                if (!t) return '';
                const s = String(t).trim();
                if (!s) return '';
                const timeMatch = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
                if (timeMatch) {
                  const hour = timeMatch[1].padStart(2, '0');
                  const min = timeMatch[2];
                  return `${hour}:${min}`;
                }
                if (/^\d{3,4}$/.test(s)) {
                  const padded = s.padStart(4, '0');
                  return `${padded.substring(0, 2)}:${padded.substring(2, 4)}`;
                }
                return '';
              };

              const start = normalizeTime(b.startime ?? '');
              const end = normalizeTime(b.endtime ?? '');
              const apiStatus = String(b.status ?? '').toLowerCase();
              let statusNorm = 'Pending';
              if (apiStatus === 'approve' || apiStatus === 'approved') statusNorm = 'Approved';
              else if (apiStatus === 'reject' || apiStatus === 'rejected') statusNorm = 'Rejected';
              else if (apiStatus === 'cancel' || apiStatus === 'cancelled') statusNorm = 'Cancelled';
              else if (apiStatus === 'conflict') statusNorm = 'Conflict';
              else if (apiStatus === 'feedbacked' ) statusNorm = 'Feedbacked';
              else if (apiStatus === 'checkedin') statusNorm = 'CheckedIn';
              else if (apiStatus === 'checkedout') statusNorm = 'CheckedOut';

              return {
                id: b.bookingId,
                roomName: b.facilityCode ?? 'N/A',
                facilityId: b.facilityId ?? null,
                date: b.bookingDate ?? null,
                startTime: start,
                endTime: end,
                purpose: b.purpose ?? '',
                status: statusNorm,
                feedbackId: b.feedbackId ?? 0,
                comment: b.comment ?? '',
                rating: b.rating ?? 0,
              };
            });
            setBookings(mapped);
          } else {
            setBookings([]);
          }
        } else {
          toast?.({ title: 'Cảnh báo', description: 'Không thể tải lịch sử đặt phòng', variant: 'destructive' });
        }
      } catch (err) {
        toast?.({ title: 'Lỗi', description: 'Lỗi khi tải lịch sử đặt phòng', variant: 'destructive' });
      }
    };
    fetchUserBookings();
  }, [user]);

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        const userId = (user as any)?.userId;
        if (!userId) return;
        const res = await fetch(`/api/Booking/Stats/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalBookings: data.totalBookings ?? 0,
            successRate: data.successRate ?? 0,
            mostBookedFacilityType: data.mostBookedFacilityType ?? 'N/A',
          });
        }
      } catch (err) {
        console.warn('Error fetching stats', err);
      }
    };
    fetchBookingStats();
  }, [user]);

  const formatDate = (d: any) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('vi-VN');
  };

  const formatTime = (t: string | number | undefined) => {
    if (!t) return '—';
    return String(t).split(':').slice(0, 2).join(':');
  };

  const renderStatusBadge = (status: string) => {
    let className = "";
    let label = "";
    
    switch(status) {
      case 'Approved':
        className = "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
        label = "Đã duyệt";
        break;
      case 'Pending':
        className = "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
        label = "Chờ duyệt";
        break;
      case 'Conflict':
        className = "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200";
        label = "Trùng lịch";
        break;
      case 'Feedbacked':
        className = "bg-green-50 text-green-600 border-green-200";
        label = "Đã đánh giá";
        break;
      case 'CheckedIn':
        className = "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
        label = "Đã check-in";
        break;
      case 'CheckedOut':
        className = "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200";
        label = "Đã check-out";
        break;
      case 'Rejected':
        className = "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
        label = "Từ chối";
        break;
      default:
        className = "bg-gray-100 text-gray-700 border-gray-200";
        label = "Đã hủy";
    }

    return <Badge variant="outline" className={`${className} px-3 py-1`}>{label}</Badge>;
  };

  const handleSaveReview = async () => {
    if (!editingBooking) return;
    
    let facilityIdNum = null;
    const facilityIdRaw = editingBooking.facilityId ?? null;
    if (facilityIdRaw != null && Number(facilityIdRaw) > 0) {
      facilityIdNum = Number(facilityIdRaw);
    }
    
    if (facilityIdNum == null) {
      try {
        const detailRes = await fetch(`/api/Booking/Detail/${editingBooking.id}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const cand = detail.facilityId ?? detail.facility?.id;
          if (Number(cand) > 0) facilityIdNum = Number(cand);
        }
      } catch(e) {
        console.error('Error fetching facility ID:', e);
      }
    }

    if (!facilityIdNum) {
      toast?.({ title: 'Lỗi', description: 'Không tìm thấy ID phòng', variant: 'destructive'});
      return;
    }

    const payload = {
      comment: reviewDesc,
      rating: reviewRating,
      userId: (user as any)?.userId ?? 0,
      facilityId: facilityIdNum,
    };

    try {
      const existingId = editingBooking.feedbackId ?? 0;
      const method = existingId > 0 ? 'PUT' : 'POST';
      const url = existingId > 0 ? `/api/Feedback/${existingId}` : '/api/Feedback';
      
      const res = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      if(res.ok) {
        const data = await res.json();
        const newId = data.id ?? data.feedbackId ?? (existingId > 0 ? existingId : 1); 
        setBookings(prev => prev.map(b => 
          b.id === editingBooking.id 
            ? {...b, feedbackId: newId, comment: reviewDesc, rating: reviewRating, status: 'Feedbacked'} 
            : b
        ));
        toast?.({ title: 'Thành công', description: 'Đã lưu đánh giá' });
        setReviewOpen(false);
      } else {
        toast?.({ title: 'Lỗi', description: 'Lưu thất bại', variant: 'destructive'});
      }
    } catch(err) {
      toast?.({ title: 'Lỗi mạng', description: String(err), variant: 'destructive'});
    }
  };

  const handleDeleteReview = async () => {
    if (!editingBooking || !editingBooking.feedbackId) {
      toast?.({ 
        title: 'Lỗi', 
        description: 'Không tìm thấy ID đánh giá', 
        variant: 'destructive' 
      });
      return;
    }
    
    console.log('Deleting feedback ID:', editingBooking.feedbackId);
    
    try {
      const res = await fetch(`/api/Feedback/${editingBooking.feedbackId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setBookings(prev => prev.map(b => 
          b.id === editingBooking.id 
            ? {...b, feedbackId: 0, comment: '', rating: 0, status: 'CheckedOut'} 
            : b
        ));
        toast?.({ 
          title: 'Đã xóa', 
          description: 'Đánh giá đã được xóa thành công' 
        });
        setDeleteConfirmOpen(false);
        setReviewOpen(false);
      } else {
        const errorText = await res.text();
        console.error('Delete failed:', res.status, errorText);
        toast?.({ 
          title: 'Lỗi', 
          description: 'Không thể xóa đánh giá', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast?.({ 
        title: 'Lỗi mạng', 
        description: 'Lỗi khi xóa đánh giá', 
        variant: 'destructive' 
      });
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    
    try {
      const res = await fetch(`/api/Booking/Cancel/${cancellingBooking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => 
          b.id === cancellingBooking.id 
            ? {...b, status: 'Cancelled'} 
            : b
        ));
        toast?.({ 
          title: 'Thành công', 
          description: 'Đã hủy đặt phòng thành công' 
        });
        setCancelConfirmOpen(false);
        setCancellingBooking(null);
      } else {
        toast?.({ 
          title: 'Lỗi', 
          description: 'Không thể hủy đặt phòng', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      toast?.({ 
        title: 'Lỗi mạng', 
        description: 'Lỗi khi hủy đặt phòng', 
        variant: 'destructive' 
      });
    }
  };

  const handleCheckIn = async () => {
    if (!checkingBooking) return;
    
    try {
      const formData = new FormData();
      formData.append('bookingId', checkingBooking.id.toString());
      formData.append('comment', checkComment);
      
      checkImages.forEach((file) => {
        formData.append('imageUrls', file);
      });

      const res = await fetch(`/api/Booking/CheckIn/${checkingBooking.id}`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setBookings(prev => prev.map(b => 
          b.id === checkingBooking.id 
            ? {...b, status: 'CheckedIn'} 
            : b
        ));
        toast?.({ 
          title: 'Thành công', 
          description: 'Check-in thành công' 
        });
        setCheckInOpen(false);
        setCheckComment('');
        setCheckImages([]);
        setCheckingBooking(null);
      } else {
        toast?.({ 
          title: 'Lỗi', 
          description: 'Không thể check-in do chưa đến giờ ', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      toast?.({ 
        title: 'Lỗi mạng', 
        description: 'Lỗi khi check-in', 
        variant: 'destructive' 
      });
    }
  };

  const handleCheckOut = async () => {
    if (!checkingBooking) return;
    
    try {
      const formData = new FormData();
      formData.append('bookingId', checkingBooking.id.toString());
      formData.append('comment', checkComment);
      
      checkImages.forEach((file) => {
        formData.append('imageUrls', file);
      });

      const res = await fetch(`/api/Booking/CheckOut/${checkingBooking.id}`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setBookings(prev => prev.map(b => 
          b.id === checkingBooking.id 
            ? {...b, status: 'CheckedOut'} 
            : b
        ));
        toast?.({ 
          title: 'Thành công', 
          description: 'Check-out thành công. Vui lòng đánh giá!' 
        });
        setCheckOutOpen(false);
        setCheckComment('');
        setCheckImages([]);
        setCheckingBooking(null);
      } else {
        toast?.({ 
          title: 'Lỗi', 
          description: 'Không thể check-out', 
          variant: 'destructive' 
        });
      }
    } catch (err) {
      toast?.({ 
        title: 'Lỗi mạng', 
        description: 'Lỗi khi check-out', 
        variant: 'destructive' 
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setCheckImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setCheckImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 rounded-b-[3rem] shadow-2xl z-0" />
      
      <div className="relative z-10">
        <Header />

        <main className="container py-10">
          <div className="mb-8 text-white">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Trung tâm cá nhân</h1>
            <p className="text-blue-100 opacity-90 text-lg">Quản lý lịch đặt phòng và theo dõi hoạt động của bạn</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-72 flex-shrink-0">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-lg overflow-hidden sticky top-24">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
                      {(user as any)?.fullName?.[0] || 'U'}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{(user as any)?.fullName || 'Người dùng'}</CardTitle>
                      <CardDescription className="text-orange-600/80">Sinh viên</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 ${active === 'history' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-300' 
                      : 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'}`}
                    onClick={() => setActive('history')}
                  >
                    <History className="mr-3 h-5 w-5" /> Lịch sử đặt phòng
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start text-base h-12 rounded-xl transition-all duration-300 ${active === 'report' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-300' 
                      : 'hover:bg-green-50 text-slate-600 hover:text-green-600'}`}
                    onClick={() => setActive('report')}
                  >
                    <TrendingUp className="mr-3 h-5 w-5" /> Báo cáo & Thống kê
                  </Button>
                </CardContent>
              </Card>
            </aside>

            <section className="flex-1 min-w-0">
              {active === 'history' && (
                <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="border-b border-gray-100 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
                          <CalendarDays className="h-6 w-6 text-orange-500" />
                          Lịch sử đặt phòng
                        </CardTitle>
                        <CardDescription className="mt-1">Theo dõi trạng thái các yêu cầu của bạn</CardDescription>
                      </div>
                      <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                        Tổng: {userBookings.length} yêu cầu
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-md">
                      <Table>
                        <TableHeader className="bg-slate-50/80">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-blue-900 pl-6">Phòng</TableHead>
                            <TableHead className="font-semibold text-blue-900">Ngày & Giờ</TableHead>
                            <TableHead className="font-semibold text-blue-900">Mục đích</TableHead>
                            <TableHead className="font-semibold text-blue-900 text-center">Trạng thái</TableHead>
                            <TableHead className="font-semibold text-blue-900 text-right pr-6">Hoạt động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userBookings.length > 0 ? userBookings.map((booking, index) => (
                            <TableRow key={booking.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                              <TableCell className="font-bold text-slate-700 pl-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                                  {booking.roomName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col text-sm">
                                  <span className="font-medium text-slate-700">{formatDate(booking.date)}</span>
                                  <span className="text-slate-500 text-xs flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-slate-600" title={booking.purpose}>{booking.purpose}</TableCell>
                              <TableCell className="text-center">
                                {renderStatusBadge(booking.status)}
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-8 text-xs font-medium rounded-lg"
                                    onClick={async () => {
                                      setDetailLoading(true);
                                      try {
                                        const res = await fetch(`/api/Booking/Detail/${booking.id}`);
                                        if (res.ok) {
                                          const data = await res.json();
                                          setBookingDetail(data);
                                          setDetailOpen(true);
                                        } else {
                                          toast?.({ title: 'Lỗi', description: 'Không thể tải chi tiết', variant: 'destructive' });
                                        }
                                      } catch (err) {
                                        toast?.({ title: 'Lỗi', description: 'Lỗi khi tải chi tiết', variant: 'destructive' });
                                      } finally {
                                        setDetailLoading(false);
                                      }
                                    }}
                                    disabled={detailLoading}
                                  >
                                    Chi tiết
                                  </Button>

                                  {/* Cancel button - for Approved or Conflict status */}
                                  {(booking.status === 'Approved' || booking.status === 'Conflict') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs font-medium rounded-lg"
                                      onClick={() => {
                                        setCancellingBooking(booking);
                                        setCancelConfirmOpen(true);
                                      }}
                                    >
                                      Hủy
                                    </Button>
                                  )}

                                  {/* Check-in button - for Approved status */}
                                  {booking.status === 'Approved' && (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 h-8 text-xs font-medium rounded-lg border-0 shadow-sm"
                                      onClick={() => {
                                        setCheckingBooking(booking);
                                        setCheckComment('');
                                        setCheckImages([]);
                                        setCheckInOpen(true);
                                      }}
                                    >
                                      Check-in
                                    </Button>
                                  )}

                                  {/* Check-out button - for CheckedIn status */}
                                  {booking.status === 'CheckedIn' && (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 h-8 text-xs font-medium rounded-lg border-0 shadow-sm"
                                      onClick={() => {
                                        setCheckingBooking(booking);
                                        setCheckComment('');
                                        setCheckImages([]);
                                        setCheckOutOpen(true);
                                      }}
                                    >
                                      Check-out
                                    </Button>
                                  )}

                                  {/* Feedback button - for CheckedOut or Feedbacked status */}
                                  {(booking.status === 'CheckedOut' || booking.status === 'Feedbacked') && (
                                    <Button
                                      size="sm"
                                      className={`h-8 text-xs font-medium rounded-lg border shadow-sm transition-all ${
                                        booking.feedbackId > 0 
                                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 border-orange-200 hover:from-amber-200 hover:to-orange-200' 
                                          : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 border-transparent'
                                      }`}
                                      onClick={() => {
                                        setEditingBooking(booking);
                                        setReviewDesc(booking.comment || '');
                                        setReviewRating((booking.rating && booking.rating > 0) ? booking.rating : 5);
                                        setReviewOpen(true);
                                      }}
                                    >
                                      {booking.feedbackId > 0 ? <><Star className="h-3 w-3 mr-1 fill-orange-600" /> Sửa đánh giá</> : 'Đánh giá'}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                Chưa có lịch sử đặt phòng nào
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {active === 'report' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl text-green-800">
                        <LayoutDashboard className="h-6 w-6 text-green-600" />
                        Tổng quan hoạt động
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                      <CardContent className="p-6 flex items-center justify-between bg-gradient-to-br from-white to-blue-50">
                        <div>
                          <p className="text-sm font-medium text-blue-600 mb-1 uppercase tracking-wider">Tổng đơn</p>
                          <p className="text-4xl font-bold text-slate-800">{stats.totalBookings}</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CalendarDays className="h-6 w-6" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                      <CardContent className="p-6 flex items-center justify-between bg-gradient-to-br from-white to-green-50">
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1 uppercase tracking-wider">Tỷ lệ thành công</p>
                          <p className="text-4xl font-bold text-slate-800">{stats.successRate}%</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                      <CardContent className="p-6 flex items-center justify-between bg-gradient-to-br from-white to-orange-50">
                        <div>
                          <p className="text-sm font-medium text-orange-600 mb-1 uppercase tracking-wider">Hay đặt nhất</p>
                          <p className="text-xl font-bold text-slate-800 truncate max-w-[150px]" title={stats.mostBookedFacilityType}>
                            {stats.mostBookedFacilityType}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 className="h-6 w-6" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[650px] border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <DialogTitle className="text-xl">Chi tiết đặt phòng</DialogTitle>
            <DialogDescription className="text-blue-100">Thông tin đầy đủ về yêu cầu của bạn</DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-white">
            {detailLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : bookingDetail ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mã booking</label>
                    <p className="text-lg font-bold text-blue-900">{bookingDetail.bookingCode ?? bookingDetail.bookingId}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái</label>
                    <div>{renderStatusBadge(bookingDetail.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phòng / Cơ sở</label>
                    <p className="font-medium text-gray-800">{bookingDetail.facilityCode} <span className="text-gray-400">|</span> {bookingDetail.campusName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thời gian</label>
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                      <CalendarDays className="h-4 w-4 text-orange-500" />
                      {formatDate(bookingDetail.bookingDate)}
                      <span className="text-gray-300">|</span>
                      {formatTime(bookingDetail.startTime)} - {formatTime(bookingDetail.endTime)}
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mục đích</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{bookingDetail.purpose || '—'}</p>
                  </div>
                </div>

                {bookingDetail.rejectionReason && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3">
                    <div className="mt-1"><div className="h-2 w-2 bg-red-500 rounded-full"></div></div>
                    <div>
                      <label className="text-sm font-bold text-red-800 block mb-1">Lý do từ chối</label>
                      <p className="text-sm text-red-700">{bookingDetail.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Không có dữ liệu</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">Đánh giá trải nghiệm</DialogTitle>
            <DialogDescription className="text-center">Hãy chia sẻ cảm nhận của bạn về phòng này</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setReviewRating(n)}
                  className={`text-4xl transition-transform hover:scale-110 focus:outline-none ${reviewRating >= n ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="text-center font-medium text-orange-500">
              {reviewRating === 5 ? 'Tuyệt vời!' : reviewRating === 4 ? 'Rất tốt' : reviewRating === 3 ? 'Bình thường' : 'Cần cải thiện'}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nội dung đánh giá</label>
              <textarea
                value={reviewDesc}
                onChange={(e) => setReviewDesc(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none min-h-[100px] bg-gray-50 resize-none transition-all"
                placeholder="Phòng sạch sẽ, thiết bị tốt..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {editingBooking?.feedbackId > 0 && (
              <Button 
                variant="ghost" 
                className="text-red-500 hover:bg-red-50 hover:text-red-600 mr-auto" 
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Xóa đánh giá
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setReviewOpen(false)} className="flex-1 sm:flex-none">Hủy</Button>
              <Button 
                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 border-0"
                onClick={handleSaveReview}
              >
                Gửi đánh giá
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Hủy bỏ
            </Button>
            <Button 
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteReview}
            >
              Xóa đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-2xl">⚠️</span>
              </div>
              Xác nhận hủy đặt phòng
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              Bạn có chắc chắn muốn hủy đặt phòng <strong>{cancellingBooking?.roomName}</strong> vào ngày <strong>{formatDate(cancellingBooking?.date)}</strong> không?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCancelConfirmOpen(false);
                setCancellingBooking(null);
              }}
              className="flex-1 sm:flex-none"
            >
              Không, giữ lại
            </Button>
            <Button 
              className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleCancelBooking}
            >
              Có, hủy đặt phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">Check-in phòng</DialogTitle>
            <DialogDescription className="text-center">Ghi chú và chụp ảnh trạng thái phòng khi bắt đầu sử dụng</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ghi chú (tùy chọn)</label>
              <textarea
                value={checkComment}
                onChange={(e) => setCheckComment(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none min-h-[80px] bg-gray-50 resize-none transition-all"
                placeholder="Ghi chú về tình trạng phòng lúc nhận..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hình ảnh (tùy chọn)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="checkin-image-upload"
                />
                <label htmlFor="checkin-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-sm text-gray-600">Nhấn để chọn ảnh</p>
                </label>
              </div>

              {checkImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {checkImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCheckInOpen(false)} className="flex-1 sm:flex-none">Hủy</Button>
            <Button 
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-200 border-0"
              onClick={handleCheckIn}
            >
              Xác nhận Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">Check-out phòng</DialogTitle>
            <DialogDescription className="text-center">Ghi chú và chụp ảnh trạng thái phòng khi kết thúc sử dụng</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ghi chú (tùy chọn)</label>
              <textarea
                value={checkComment}
                onChange={(e) => setCheckComment(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none min-h-[80px] bg-gray-50 resize-none transition-all"
                placeholder="Ghi chú về tình trạng phòng lúc trả..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hình ảnh (tùy chọn)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="checkout-image-upload"
                />
                <label htmlFor="checkout-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-sm text-gray-600">Nhấn để chọn ảnh</p>
                </label>
              </div>

              {checkImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {checkImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCheckOutOpen(false)} className="flex-1 sm:flex-none">Hủy</Button>
            <Button 
              className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-200 border-0"
              onClick={handleCheckOut}
            >
              Xác nhận Check-out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Information;