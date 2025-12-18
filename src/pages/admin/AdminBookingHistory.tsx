import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "/api/Booking";
const CURRENT_ADMIN_ID = 1;

interface BookingListItem {
  id: string | number;
  roomId: string;
  roomName: string;
  userId: string;
  userEmail: string;
  rolename: string; // Thêm trường vai trò
  date: string;
  startTime: string;
  endTime: string;
  status:
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Cancelled"
    | "Feedbacked"
    | "Conflict"
    | "CheckedIn"
    | "CheckedOut";
  purpose: string;
  createdAt: string;
}

interface CheckInOut {
  createAt: string;
  comment: string;
  imageUrls: string[];
}

interface BookingDetail {
  bookingId: number;
  bookingCode: string;
  status: string;
  createAt: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string; // Thêm vào detail
  facilityCode: string;
  typeName: string;
  campusName: string;
  capacity: number;
  floor: number;
  equipment: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  checkIn?: CheckInOut | null;
  checkOut?: CheckInOut | null;
}

// Hàm dịch Vai trò sang tiếng Việt
const translateRolename = (role: string): string => {
  if (!role) return "N/A";
  const lowerRole = role.toLowerCase().trim();
  switch (lowerRole) {
    case "student":
      return "Sinh viên";
    case "lecturer":
      return "Giảng viên";
    case "admin":
      return "Quản trị viên";
    default:
      return role;
  }
};

export const AdminBookingHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<
    string | number | null
  >(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const mapListResponseToFrontend = (apiData: any): BookingListItem => {
    const statusMap: Record<string, BookingListItem["status"]> = {
      approve: "Approved",
      approved: "Approved",
      reject: "Rejected",
      rejected: "Rejected",
      cancel: "Cancelled",
      cancelled: "Cancelled",
      conflict: "Conflict",
      feedbacked: "Feedbacked",
      checkedin: "CheckedIn",
      checkedout: "CheckedOut",
    };

    const apiStatus = String(apiData.status || "").toLowerCase();
    let status: BookingListItem["status"] = statusMap[apiStatus] || "Pending";
    if (apiStatus === "conflict") status = "Conflict";

    return {
      id: apiData.bookingId,
      roomId: apiData.facilityCode,
      roomName: apiData.facilityCode || apiData.facilityName,
      userId: apiData.bookingCode,
      userEmail: apiData.fullName,
      rolename: translateRolename(apiData.roleName), // Dịch vai trò từ API
      date: apiData.bookingDate,
      startTime: apiData.startTime,
      endTime: apiData.endTime,
      status,
      purpose: apiData.purpose,
      createdAt: apiData.createAt || new Date().toISOString(),
    };
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/List`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data.map(mapListResponseToFrontend));
    } catch (error) {
      console.error("Error fetching list:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewDetail = async (id: number | string) => {
    setIsDetailDialogOpen(true);
    setIsDetailLoading(true);
    setBookingDetail(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Detail/${id}`);
      if (!response.ok) throw new Error("Failed to fetch detail");
      const data: BookingDetail = await response.json();
      setBookingDetail(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết booking.",
        variant: "destructive",
      });
      setIsDetailDialogOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string | number,
    newStatus: string,
    reason = ""
  ) => {
    try {
      const url = `${API_BASE_URL}/${bookingId}?currentUserId=${CURRENT_ADMIN_ID}`;
      const payloadStatus =
        newStatus.toLowerCase() === "approve" ? "Approved" : "Rejected";
      const payload = {
        status: payloadStatus,
        rejectionReason: payloadStatus === "Approved" ? "" : reason,
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update");
      toast({
        title: "Thành công",
        description: `Đã cập nhật trạng thái booking #${bookingId}.`,
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật booking.",
        variant: "destructive",
      });
    } finally {
      setIsRejectDialogOpen(false);
      setRejectReason("");
    }
  };

  const handleApprove = (id: string | number) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking?.status === "Conflict") {
      if (
        !window.confirm(
          "Duyệt booking này sẽ tự động từ chối các booking trùng lịch. Tiếp tục?"
        )
      )
        return;
    }
    updateBookingStatus(id, "approve");
  };

  const handleRejectConfirm = () => {
    if (!selectedBookingId || !rejectReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối",
        variant: "destructive",
      });
      return;
    }
    updateBookingStatus(selectedBookingId, "reject", rejectReason);
  };

  const openRejectDialog = (id: string | number) => {
    setSelectedBookingId(id);
    setIsRejectDialogOpen(true);
  };

  const formatTime = (t: string) => t?.split(":").slice(0, 2).join(":") || "";

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      statusFilter === "all" ||
      b.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      b.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderStatusBadge = (statusStr: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      approved: { variant: "default", label: "Đã duyệt" },
      rejected: { variant: "destructive", label: "Từ chối" },
      cancelled: { variant: "outline", label: "Đã hủy" },
      conflict: { variant: "destructive", label: "Trùng lịch" },
      feedbacked: { variant: "secondary", label: "Đã đánh giá" },
      checkedin: { variant: "default", label: "Đã check-in" },
      checkedout: { variant: "secondary", label: "Đã check-out" },
      pending: { variant: "secondary", label: "Chờ duyệt" },
    };
    const s = statusStr?.toLowerCase() || "pending";
    const config = statusConfig[s] || statusConfig["pending"];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            Quản lý đặt phòng
          </h1>
          <p className="text-muted-foreground">Danh sách yêu cầu đặt phòng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchBookings}>
            <RefreshCw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
              <Input
                placeholder="Tìm tên người đặt hoặc phòng..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="conflict">Trùng lịch</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="checkedin">Đã check-in</SelectItem>
                <SelectItem value="checkedout">Đã check-out</SelectItem>
                <SelectItem value="feedbacked">Đã đánh giá</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Người đặt</TableHead>
                  <TableHead>Vai trò</TableHead> {/* Thêm cột vai trò */}
                  <TableHead>Phòng</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-4 text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">
                        #{b.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {b.userEmail}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {b.rolename}
                        </Badge>
                      </TableCell>
                      <TableCell>{b.roomName}</TableCell>
                      <TableCell>
                        {new Date(b.date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {formatTime(b.startTime)} - {formatTime(b.endTime)}
                      </TableCell>
                      <TableCell>{renderStatusBadge(b.status)}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        {(b.status === "Pending" ||
                          b.status === "Conflict") && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleApprove(b.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 px-2"
                              onClick={() => openRejectDialog(b.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => handleViewDetail(b.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Không tìm thấy booking
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
            <DialogDescription>Nhập lý do từ chối</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt phòng</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : bookingDetail ? (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  {bookingDetail.facilityCode}
                  <Badge variant="outline">
                    {bookingDetail.typeName || "N/A"}
                  </Badge>
                  {renderStatusBadge(bookingDetail.status)}
                </h3>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />{" "}
                  {bookingDetail.campusName || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Người yêu cầu
                  </label>
                  <div className="rounded bg-muted p-2">
                    <p className="font-medium text-sm">
                      {bookingDetail.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {translateRolename(bookingDetail.roleName)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Liên hệ
                  </label>
                  <div className="rounded bg-muted p-2">
                    <p className="text-xs">{bookingDetail.email}</p>
                    <p className="text-xs">{bookingDetail.phone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày đặt</label>
                  <div className="flex items-center gap-2 rounded bg-muted p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {new Date(bookingDetail.bookingDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thời gian</label>
                  <div className="flex items-center gap-2 rounded bg-muted p-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {formatTime(bookingDetail.startTime)} -{" "}
                      {formatTime(bookingDetail.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded bg-muted p-2">
                  <p className="text-xs text-gray-500">Sức chứa</p>
                  <p className="font-bold">{bookingDetail.capacity}</p>
                </div>
                <div className="rounded bg-muted p-2">
                  <p className="text-xs text-gray-500">Tầng</p>
                  <p className="font-bold">{bookingDetail.floor}</p>
                </div>
                <div className="rounded bg-muted p-2">
                  <p className="text-xs text-gray-500">Mã đặt</p>
                  <p className="font-bold">{bookingDetail.bookingCode}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mục đích</label>
                <div className="rounded border bg-muted p-3">
                  <p className="text-sm italic">"{bookingDetail.purpose}"</p>
                </div>
              </div>

              {/* Check-in/out sections (Giữ nguyên logic của bạn) */}
              {bookingDetail.checkIn && (
                <div className="mt-2 border-t pt-4">
                  <h4 className="font-semibold text-green-700 mb-2">
                    Thông tin Check-in
                  </h4>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                    <p className="text-xs mb-1">
                      Thời gian:{" "}
                      {new Date(bookingDetail.checkIn.createAt).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                    <p>
                      Ghi chú: {bookingDetail.checkIn.comment || "Không có"}
                    </p>
                    {bookingDetail.checkIn.imageUrls?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {bookingDetail.checkIn.imageUrls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            className="w-16 h-16 object-cover rounded border cursor-pointer"
                            onClick={() => setSelectedImage(url)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Tương tự cho checkOut... */}
            </div>
          ) : (
            <div className="py-8 text-center text-destructive">
              Không tìm thấy dữ liệu
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <img
            src={selectedImage!}
            alt="Preview"
            className="w-full h-auto rounded"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
