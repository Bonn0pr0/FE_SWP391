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
import { TrendingUp } from 'lucide-react';
import { mockBookings, Booking } from '@/lib/mockData';
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
              // normalize time string to HH:MM if possible
              const normalizeTime = (t: any) => {
                if (!t) return '';
                const s = String(t).trim();
                if (!s) return '';
                
                // Match HH:MM:SS or HH:MM format
                const timeMatch = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
                if (timeMatch) {
                  const hour = timeMatch[1].padStart(2, '0');
                  const min = timeMatch[2];
                  return `${hour}:${min}`;
                }
                
                // If it's a 3-4 digit number like "0730" or "730"
                if (/^\d{3,4}$/.test(s)) {
                  const padded = s.padStart(4, '0');
                  return `${padded.substring(0, 2)}:${padded.substring(2, 4)}`;
                }
                
                return '';
              };

              // API response has: startime, endtime (not startTime, endTime)
              const start = normalizeTime(b.startime ?? '');
              const end = normalizeTime(b.endtime ?? '');

              // normalize status to match UI labels (Approved, Pending, Rejected, Cancelled, Conflict)
              const apiStatus = String(b.status ?? '').toLowerCase();
              let statusNorm = 'Pending';
              if (apiStatus === 'approve' || apiStatus === 'approved') statusNorm = 'Approved';
              else if (apiStatus === 'reject' || apiStatus === 'rejected') statusNorm = 'Rejected';
              else if (apiStatus === 'cancel' || apiStatus === 'cancelled') statusNorm = 'Cancelled';
              else if (apiStatus === 'conflict') statusNorm = 'Conflict';

              return {
                id: b.bookingId,
                roomName: b.facilityCode ?? 'N/A',
                facilityId: b.facilityId ?? null,
                date: b.bookingDate ?? null,
                startTime: start,
                endTime: end,
                purpose: b.purpose ?? '',
                status: statusNorm,
                review: b.review,
              };
            });
            setBookings(mapped);
          } else {
            setBookings([]);
          }
        } else {
          console.warn('Failed to fetch user bookings:', res.statusText);
          toast?.({ title: 'Cảnh báo', description: 'Không thể tải lịch sử đặt phòng', variant: 'destructive' });
        }
      } catch (err) {
        console.warn('Error fetching user bookings:', err);
        toast?.({ title: 'Lỗi', description: 'Lỗi khi tải lịch sử đặt phòng', variant: 'destructive' });
      }
    };

    // fetch bookings whenever user changes
    fetchUserBookings();
  }, [user]);

  // Fetch booking stats
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
        } else {
          console.warn('Failed to fetch booking stats:', res.statusText);
        }
      } catch (err) {
        console.warn('Error fetching booking stats:', err);
      }
    };

    fetchBookingStats();
  }, [user]);

  const total = userBookings.length;
  const approvedCount = userBookings.filter(b => b.status === 'Approved').length;
  const successRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

  const formatDate = (d: any) => {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('vi-VN');
  };

  const formatTime = (t: string | number | undefined) => {
    if (!t) return '—';
    return String(t).split(':').slice(0, 2).join(':');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex gap-6">
          {/* Left: navigation */}
          <aside className="w-64">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý</CardTitle>
                <CardDescription>Chọn mục để xem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <button
                    className={`text-left rounded-md p-2 ${active === 'history' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
                    onClick={() => setActive('history')}
                  >
                    Lịch sử đặt phòng
                  </button>
                  <button
                    className={`text-left rounded-md p-2 ${active === 'report' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
                    onClick={() => setActive('report')}
                  >
                    Báo cáo sử dụng
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right: content */}
          <section className="flex-1">
            {active === 'history' && (
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử đặt phòng</CardTitle>
                  <CardDescription>Các đặt phòng gần đây của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Mục đích</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hoạt động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userBookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.roomName}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</TableCell>
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
                               booking.status === 'Conflict' ? 'Trùng lịch' :
                               booking.status === 'Rejected' ? 'Từ chối' : 'Đã hủy'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  setDetailLoading(true);
                                  try {
                                    const res = await fetch(`/api/Booking/Detail/${booking.id}`);
                                    if (res.ok) {
                                      const data = await res.json();
                                      setBookingDetail(data);
                                      setDetailOpen(true);
                                    } else {
                                      toast?.({ title: 'Lỗi', description: 'Không thể tải chi tiết booking', variant: 'destructive' });
                                    }
                                  } catch (err) {
                                    toast?.({ title: 'Lỗi', description: 'Lỗi khi tải chi tiết', variant: 'destructive' });
                                  } finally {
                                    setDetailLoading(false);
                                  }
                                }}
                                disabled={detailLoading}
                              >
                                Xem chi tiết
                              </Button>
                              {booking.status === 'Approved' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingBooking(booking);
                                    setReviewDesc(booking.review?.description || '');
                                    setReviewRating(booking.review?.rating ?? 5);
                                    setReviewOpen(true);
                                  }}
                                >
                                  {booking.review ? 'Chỉnh sửa' : 'Đánh giá'}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" disabled title="Chỉ được đánh giá khi đã duyệt">Đánh giá</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Chi tiết đặt phòng</DialogTitle>
                </DialogHeader>
                {detailLoading ? (
                  <div className="flex justify-center py-8">
                    <p className="text-muted-foreground">Đang tải...</p>
                  </div>
                ) : bookingDetail ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Mã booking</label>
                        <p className="text-lg font-medium">{bookingDetail.bookingCode ?? bookingDetail.bookingId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Phòng</label>
                        <p className="text-lg font-medium">{bookingDetail.facilityCode ?? bookingDetail.facilityName ?? 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Ngày đặt</label>
                        <p className="text-lg font-medium">{formatDate(bookingDetail.bookingDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Thời gian</label>
                        <p className="text-lg font-medium">{formatTime(bookingDetail.startime)} - {formatTime(bookingDetail.endtime)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Trạng thái</label>
                        <p className="text-lg font-medium">
                          <Badge variant={bookingDetail.status?.toLowerCase() === 'approved' ? 'default' : bookingDetail.status?.toLowerCase() === 'pending' ? 'secondary' : 'destructive'}>
                            {bookingDetail.status || 'N/A'}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Số lượng người</label>
                        <p className="text-lg font-medium">{bookingDetail.numberOfMember ?? 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Mục đích</label>
                      <p className="text-base">{bookingDetail.purpose || '—'}</p>
                    </div>
                    {bookingDetail.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <label className="text-sm font-semibold text-red-800">Lý do từ chối</label>
                        <p className="text-base text-red-700">{bookingDetail.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Không có dữ liệu</p>
                )}
              </DialogContent>
            </Dialog>

            {/* Review Dialog */}
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đánh giá đặt phòng</DialogTitle>
                  <DialogDescription>Viết đánh giá và chấm sao cho lần đặt này</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-sm font-medium">Mô tả</label>
                    <textarea
                      value={reviewDesc}
                      onChange={(e) => setReviewDesc(e.target.value)}
                      className="w-full mt-1 p-2 border border-input rounded-md min-h-[100px]"
                      placeholder="Viết mô tả về trải nghiệm..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Đánh giá sao</label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          onClick={() => setReviewRating(n)}
                          aria-label={`Chọn ${n} sao`}
                          className={`px-3 py-1 rounded-md ${reviewRating >= n ? 'bg-yellow-400 text-black' : 'bg-muted/20'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">{reviewRating} / 5</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        if (!editingBooking) return;
                        try {
                          const reviewId = editingBooking.review?.id;
                          if (reviewId) {
                            const res = await fetch(`/api/Feedback/${reviewId}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Xóa feedback thất bại');
                          }
                          setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, review: undefined } : b));
                          toast?.({ title: 'Đã xóa đánh giá' });
                        } catch (err) {
                          toast?.({ title: 'Lỗi', description: String(err), variant: 'destructive' });
                        } finally {
                          setReviewOpen(false);
                        }
                      }}
                    >Xóa</Button>

                    <div className="ml-auto">
                      <Button
                        onClick={async () => {
                          if (!editingBooking) return;
                          // determine numeric facilityId. If booking mapping doesn't include it, try booking detail endpoint.
                          let facilityIdNum: number | null = null;
                          const facilityIdRaw = editingBooking.facilityId ?? null;
                          if (facilityIdRaw != null) {
                            const n = Number(facilityIdRaw);
                            if (Number.isInteger(n) && n > 0) facilityIdNum = n;
                          }

                          if (facilityIdNum == null) {
                            // try fetching booking detail to find numeric facility id
                            try {
                              const detailRes = await fetch(`/api/Booking/Detail/${editingBooking.id}`);
                              if (detailRes.ok) {
                                const detail = await detailRes.json();
                                const cand = detail.facilityId ?? detail.facility?.facilityId ?? detail.facility?.id ?? detail.facilityId ?? null;
                                const nc = Number(cand);
                                if (Number.isInteger(nc) && nc > 0) facilityIdNum = nc;
                              }
                            } catch (err) {
                              console.warn('Error fetching booking detail for facilityId lookup', err);
                            }
                          }

                          if (facilityIdNum == null) {
                            toast?.({ title: 'Lỗi dữ liệu', description: 'Không có facilityId hợp lệ cho booking này. Không thể gửi đánh giá.', variant: 'destructive' });
                            setReviewOpen(false);
                            return;
                          }

                          const payload = {
                            comment: reviewDesc,
                            rating: reviewRating,
                            userId: (user as any)?.userId ?? 0,
                            facilityId: facilityIdNum,
                          } as any;

                          try {
                            const res = await fetch('/api/Feedback', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload),
                            });

                            if (res.ok) {
                              const data = await res.json();
                              const reviewObj = { id: data.id ?? data.feedbackId ?? undefined, rating: reviewRating, description: reviewDesc };
                              setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, review: reviewObj } : b));
                              toast?.({ title: 'Đã lưu đánh giá' });
                            } else {
                              const text = await res.text();
                              toast?.({ title: 'Lỗi khi lưu', description: text, variant: 'destructive' });
                            }
                          } catch (err) {
                            toast?.({ title: 'Lỗi mạng', description: String(err), variant: 'destructive' });
                          } finally {
                            setReviewOpen(false);
                          }
                        }}
                      >Lưu</Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {active === 'report' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Báo cáo sử dụng
                  </CardTitle>
                  <CardDescription>Thống kê sử dụng phòng của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Tổng số lần đặt phòng</span>
                      <span className="font-semibold">{stats.totalBookings} lần</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Tỷ lệ đặt phòng thành công</span>
                      <span className="font-semibold">{stats.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Loại phòng thường đặt nhất</span>
                      <span className="font-semibold">{stats.mostBookedFacilityType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Information;
