import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Trash2, Star, RefreshCw, Pencil, User, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  feedbackId: number;
  fullName: string;
  email: string;
  facilityCode: string;
  comments: string;
  rating: number;
  submittedAt: string;
  typeName?: string;
  adminResponse?: string;
  status?: 'pending' | 'responded' | 'resolved';
}

// Helper để tạo màu nền Avatar ngẫu nhiên giống hình mẫu
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
};

const getInitials = (name: string) => {
    return name.split(' ').pop()?.charAt(0).toUpperCase() || 'U';
}

export const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFeedbackList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/Feedback/feedbacklist');
      if (!res.ok) throw new Error('Không thể tải danh sách');
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const mapped: Feedback[] = data.map((f: any) => ({
        feedbackId: f.feedbackId ?? f.id,
        fullName: f.fullName ?? f.fullname ?? 'Người dùng',
        email: f.email ?? 'no-email@fpt.edu.vn',
        facilityCode: f.facilityCode ?? f.roomName ?? 'Unknown',
        comments: f.comments ?? f.comment ?? '',
        rating: f.rating ?? 5,
        submittedAt: f.submittedAt ?? f.createdAt ?? new Date().toISOString(),
        typeName: f.typeName,
        status: f.status || 'pending'
      }));
      setFeedbacks(mapped);
    } catch (err) {
      console.warn('Error fetching feedback', err);
      // Mock data nếu API lỗi để hiển thị giao diện
      // setFeedbacks([
      //   { feedbackId: 1, fullName: 'Nguyen Van A', email: 'anv@fpt.edu.vn', facilityCode: 'Room 101', comments: 'Máy lạnh hỏng rồi', rating: 3, submittedAt: '2025-12-10T10:00:00', typeName: 'Meeting Room', status: 'pending' },
      //   { feedbackId: 2, fullName: 'Tran Thi B', email: 'bt@fpt.edu.vn', facilityCode: 'Lab 202', comments: 'Phòng sạch sẽ, tốt', rating: 5, submittedAt: '2025-12-11T14:30:00', typeName: 'Computer Lab', status: 'resolved' },
      // ]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackList();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      (feedback.fullName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feedback.facilityCode ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feedback.comments ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || feedback.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const handleViewFeedback = (feedback: Feedback) => {
     // Giả lập fetch detail hoặc dùng luôn data có sẵn
     setSelectedFeedback(feedback);
     setIsViewDialogOpen(true);
  };

  const handleMarkResolved = (feedback: Feedback) => {
    setFeedbacks(feedbacks.map((f) => f.feedbackId === feedback.feedbackId ? { ...f, status: 'resolved' as const } : f));
    toast({ title: 'Thành công', description: 'Đã đánh dấu giải quyết.', className: 'bg-green-500 text-white border-none' });
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;
    try {
        await fetch(`/api/Feedback/${selectedFeedback.feedbackId}`, { method: 'DELETE' });
        setFeedbacks(prev => prev.filter((f) => f.feedbackId !== selectedFeedback.feedbackId));
        toast({ title: 'Đã xóa', description: 'Xóa feedback thành công.' });
    } catch {
        toast({ title: 'Lỗi', description: 'Không thể xóa.', variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                Quản Lý Đánh Giá
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Xem và phản hồi đánh giá từ người dùng</p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-slate-200 hover:bg-slate-100 w-10 h-10 text-slate-500 bg-white"
                onClick={fetchFeedbackList} 
            >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-100">
            <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Tìm kiếm theo tên, phòng hoặc nội dung..." 
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-lg h-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="w-full md:w-[200px]">
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg h-10">
                        <SelectValue placeholder="Tất cả đánh giá" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả sao</SelectItem>
                        <SelectItem value="5">5 sao</SelectItem>
                        <SelectItem value="4">4 sao</SelectItem>
                        <SelectItem value="3">3 sao</SelectItem>
                        <SelectItem value="2">2 sao</SelectItem>
                        <SelectItem value="1">1 sao</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                <TableHead className="pl-6 py-4 font-semibold text-slate-600 w-[60px]">Avatar</TableHead>
                <TableHead className="font-semibold text-slate-600">Người gửi & Email</TableHead>
                <TableHead className="font-semibold text-slate-600">Phòng & Loại</TableHead>
                <TableHead className="font-semibold text-slate-600">Đánh giá</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày gửi</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Không có dữ liệu feedback nào</TableCell></TableRow>
              ) : (
                filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.feedbackId} className="hover:bg-slate-50 border-b border-slate-100 group transition-colors">
                    {/* Avatar Column */}
                    <TableCell className="pl-6 py-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getAvatarColor(feedback.fullName)}`}>
                            {getInitials(feedback.fullName)}
                        </div>
                    </TableCell>

                    {/* User Info Column */}
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-sm">{feedback.fullName}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{feedback.email}</span>
                        </div>
                    </TableCell>

                    {/* Facility Info Column */}
                    <TableCell>
                         <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                {feedback.facilityCode}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5 inline-block px-2 py-0.5 bg-slate-100 rounded-full w-fit">
                                {feedback.typeName || 'General'}
                            </span>
                        </div>
                    </TableCell>

                    {/* Rating Column */}
                    <TableCell>
                        {renderStars(feedback.rating)}
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-[150px] italic">"{feedback.comments}"</p>
                    </TableCell>

                    {/* Date Column */}
                    <TableCell className="text-slate-500 text-sm font-medium">
                        {new Date(feedback.submittedAt).toLocaleDateString('vi-VN')}
                    </TableCell>

                    {/* Action Column */}
                    <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                onClick={() => handleViewFeedback(feedback)}
                                title="Xem chi tiết & Phản hồi"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogAction onClick={() => { setSelectedFeedback(feedback); setIsDeleteDialogOpen(true); }} asChild>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogAction>
                            </AlertDialog>
                        </div>
                    </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- VIEW / RESPOND DIALOG --- */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-2xl rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-t-xl border-b border-orange-100">
            <DialogTitle className="text-orange-600 flex items-center gap-2">
                <MessageCircle className="w-5 h-5"/> Chi tiết phản hồi
            </DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="p-6 space-y-6">
              {/* User Info Block */}
              <div className="flex items-start gap-4">
                 <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ${getAvatarColor(selectedFeedback.fullName)}`}>
                    {getInitials(selectedFeedback.fullName)}
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">{selectedFeedback.fullName}</h3>
                    <p className="text-slate-500 text-sm">{selectedFeedback.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">
                            {selectedFeedback.facilityCode}
                        </Badge>
                        <span className="text-slate-300">|</span>
                        <div className="flex">{renderStars(selectedFeedback.rating)}</div>
                    </div>
                 </div>
              </div>

              {/* Comment Box */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
                  <div className="absolute -top-3 left-4 bg-slate-50 px-2 text-xs font-bold text-slate-400">NỘI DUNG</div>
                  <p className="text-slate-700 italic">"{selectedFeedback.comments}"</p>
                  <p className="text-xs text-slate-400 mt-2 text-right">Gửi lúc: {new Date(selectedFeedback.submittedAt).toLocaleString('vi-VN')}</p>
              </div>

              {/* Admin Response Area */}
              <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phản hồi của Admin</label>
                  <Textarea 
                     placeholder="Nhập nội dung phản hồi tới người dùng..." 
                     className="focus:border-orange-400 focus:ring-orange-100 min-h-[100px]"
                     value={selectedFeedback.adminResponse || ''} // Demo readonly display if needed, or editable
                     disabled // Assuming view-only for this demo or unlock if implementing response logic
                  />
                  <p className="text-xs text-slate-400">Tính năng gửi phản hồi đang được cập nhật.</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-slate-200">Đóng</Button>
            {selectedFeedback?.status !== 'resolved' && (
                <Button onClick={() => { handleMarkResolved(selectedFeedback!); setIsViewDialogOpen(false); }} className="bg-green-600 hover:bg-green-700 text-white">
                    Đánh dấu đã xử lý
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE ALERT --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Xác nhận xóa phản hồi?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn đánh giá của <strong>{selectedFeedback?.fullName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFeedback} className="bg-red-600 hover:bg-red-700 rounded-lg">
              Xóa ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};