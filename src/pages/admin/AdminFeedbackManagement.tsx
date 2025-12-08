import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Eye, MessageSquare, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roomName: string;
  rating: number;
  content: string;
  status: 'pending' | 'responded' | 'resolved';
  createdAt: string;
  adminResponse?: string;
  respondedAt?: string;
}

const initialFeedbacks: Feedback[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Nguyễn Văn A',
    userEmail: 'nguyenvana@fpt.edu.vn',
    roomName: 'Phòng họp A101',
    rating: 4,
    content: 'Phòng họp sạch sẽ, trang thiết bị đầy đủ. Tuy nhiên máy chiếu hơi cũ.',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Trần Thị B',
    userEmail: 'tranthib@fe.edu.vn',
    roomName: 'Phòng Lab B201',
    rating: 5,
    content: 'Phòng lab rất tốt, máy tính chạy nhanh, phần mềm đầy đủ.',
    status: 'responded',
    createdAt: '2024-01-14T14:20:00',
    adminResponse: 'Cảm ơn bạn đã phản hồi tích cực!',
    respondedAt: '2024-01-14T16:00:00',
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Lê Văn C',
    userEmail: 'levanc@fpt.edu.vn',
    roomName: 'Sân bóng đá',
    rating: 3,
    content: 'Sân cỏ cần được bảo dưỡng, một số vùng bị hỏng.',
    status: 'resolved',
    createdAt: '2024-01-13T09:15:00',
    adminResponse: 'Chúng tôi đã lên lịch bảo dưỡng sân vào tuần tới. Cảm ơn bạn đã phản hồi!',
    respondedAt: '2024-01-13T11:30:00',
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'Phạm Thị D',
    userEmail: 'phamthid@fpt.edu.vn',
    roomName: 'Giảng đường C301',
    rating: 2,
    content: 'Điều hòa không hoạt động tốt, phòng khá nóng.',
    status: 'pending',
    createdAt: '2024-01-16T08:45:00',
  },
];

export const AdminFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const { toast } = useToast();

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || feedback.rating === parseInt(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsViewDialogOpen(true);
  };

  const handleOpenResponse = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.adminResponse || '');
    setIsResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setFeedbacks(feedbacks.map((f) =>
      f.id === selectedFeedback.id
        ? {
            ...f,
            adminResponse: responseText,
            status: 'responded' as const,
            respondedAt: new Date().toISOString(),
          }
        : f
    ));

    toast({
      title: 'Đã gửi phản hồi',
      description: 'Phản hồi của bạn đã được gửi thành công.',
    });

    setIsResponseDialogOpen(false);
    setResponseText('');
    setSelectedFeedback(null);
  };

  const handleMarkResolved = (feedback: Feedback) => {
    setFeedbacks(feedbacks.map((f) =>
      f.id === feedback.id ? { ...f, status: 'resolved' as const } : f
    ));

    toast({
      title: 'Đã đánh dấu hoàn thành',
      description: 'Feedback đã được đánh dấu là đã giải quyết.',
    });
  };

  const handleDeleteFeedback = () => {
    if (!selectedFeedback) return;

    setFeedbacks(feedbacks.filter((f) => f.id !== selectedFeedback.id));

    toast({
      title: 'Đã xóa feedback',
      description: 'Feedback đã được xóa thành công.',
    });

    setIsDeleteDialogOpen(false);
    setSelectedFeedback(null);
  };

  const getStatusBadge = (status: Feedback['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Chờ xử lý</Badge>;
      case 'responded':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Đã phản hồi</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Đã giải quyết</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Feedback</h1>
        <p className="text-muted-foreground mt-1">Xem và phản hồi feedback từ người dùng</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, phòng, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="responded">Đã phản hồi</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Đánh giá" />
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người gửi</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không có feedback nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{feedback.userName}</p>
                          <p className="text-sm text-muted-foreground">{feedback.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{feedback.roomName}</TableCell>
                      <TableCell>{renderStars(feedback.rating)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{feedback.content}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>{formatDate(feedback.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewFeedback(feedback)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenResponse(feedback)}
                            title="Phản hồi"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết Feedback</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Người gửi</p>
                  <p className="font-medium">{selectedFeedback.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedFeedback.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phòng</p>
                  <p className="font-medium">{selectedFeedback.roomName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đánh giá</p>
                {renderStars(selectedFeedback.rating)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nội dung feedback</p>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedFeedback.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Trạng thái:</p>
                {getStatusBadge(selectedFeedback.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày gửi</p>
                <p>{formatDate(selectedFeedback.createdAt)}</p>
              </div>
              {selectedFeedback.adminResponse && (
                <div>
                  <p className="text-sm text-muted-foreground">Phản hồi của Admin</p>
                  <p className="mt-1 p-3 bg-primary/10 rounded-md">{selectedFeedback.adminResponse}</p>
                  {selectedFeedback.respondedAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Phản hồi lúc: {formatDate(selectedFeedback.respondedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedFeedback?.status === 'responded' && (
              <Button onClick={() => handleMarkResolved(selectedFeedback)}>
                Đánh dấu đã giải quyết
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Phản hồi Feedback</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Nội dung feedback:</p>
                <p>{selectedFeedback.content}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phản hồi của bạn</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Nhập phản hồi..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitResponse} disabled={!responseText.trim()}>
              Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa feedback này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFeedback} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};