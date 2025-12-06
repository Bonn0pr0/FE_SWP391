import * as React from 'react';
import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const Information = () => {
  const [active, setActive] = useState<'history' | 'report'>('history');
  const [bookings, setBookings] = useState<Array<Booking>>(Array.isArray(mockBookings) ? mockBookings : []);
  const userBookings = bookings;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [reviewDesc, setReviewDesc] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);

  const total = userBookings.length;
  const approvedCount = userBookings.filter(b => b.status === 'Approved').length;
  const successRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

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
                      onClick={() => {
                        // Delete review
                        if (!editingBooking) return;
                        setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, review: undefined } : b));
                        setReviewOpen(false);
                      }}
                    >Xóa</Button>

                    <div className="ml-auto">
                      <Button
                        onClick={() => {
                          if (!editingBooking) return;
                          const updated = { ...editingBooking, review: { rating: reviewRating, description: reviewDesc } } as Booking;
                          setBookings(prev => prev.map(b => b.id === editingBooking.id ? updated : b));
                          setReviewOpen(false);
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
                      <span className="font-semibold">{total} lần</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Tỷ lệ đặt phòng thành công</span>
                      <span className="font-semibold">{successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Loại phòng thường đặt nhất</span>
                      <span className="font-semibold">Meeting Room</span>
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
