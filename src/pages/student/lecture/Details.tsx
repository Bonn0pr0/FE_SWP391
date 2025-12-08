"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Users, Monitor, Goal, Mic2 } from "lucide-react";
import React from "react";

// Định nghĩa kiểu dữ liệu để dễ quản lý màu sắc
type ThemeColor = "blue" | "green" | "orange" | "cyan";

interface RoomData {
  name: string;
  capacity: string;
  equipment: string[];
  rules: string[];
  theme: ThemeColor;
  icon: React.ReactNode;
}

const rooms: RoomData[] = [
  {
    name: "Meeting Room",
    capacity: "10–20 người",
    theme: "blue",
    icon: <Users className="w-6 h-6" />,
    equipment: [
      "Máy chiếu hoặc TV 4K",
      "Hệ thống âm thanh hội nghị",
      "Bàn họp cao cấp + ghế xoay",
      "Wi-Fi 6 tốc độ cao, điều hòa",
    ],
    rules: ["Đặt lịch trước qua hệ thống", "Giữ trật tự chung", "Không mang đồ ăn nặng mùi"],
  },
  {
    name: "Computer Lab",
    capacity: "30–50 máy",
    theme: "cyan", // Biến thể xanh dương cho công nghệ
    icon: <Monitor className="w-6 h-6" />,
    equipment: [
      "PC cấu hình cao (i7/Ryzen 7)",
      "Màn hình độ phân giải cao",
      "Full bộ phần mềm bản quyền",
      "Mạng LAN nội bộ Gigabit",
    ],
    rules: ["Không tự ý cài đặt phần mềm lạ", "Tuyệt đối không ăn uống", "Tắt máy sau khi sử dụng"],
  },
  {
    name: "Football Field",
    capacity: "Sân 5–7 người",
    theme: "green",
    icon: <Goal className="w-6 h-6" />,
    equipment: ["Mặt cỏ nhân tạo tiêu chuẩn FIFA", "Hệ thống đèn LED chiếu sáng đêm", "Khu vực ghế ngồi cầu thủ dự bị"],
    rules: ["Đặt sân", "Chỉ sử dụng giày đinh dăm (TF)", "Vứt rác đúng nơi quy định"],
  },
  {
    name: "Lecture Hall",
    capacity: "80–200 người",
    theme: "blue", // Sử dụng lại blue cho tính chất hội nghị
    icon: <Mic2 className="w-6 h-6" />,
    equipment: ["Hệ thống loa công suất lớn + Micro không dây", "Màn chiếu kích thước lớn", "Camera PTZ hỗ trợ họp trực tuyến"],
    rules: ["Giữ im lặng trong giờ sự kiện", "Không tự ý thay đổi đấu nối thiết bị", "Báo ngay kỹ thuật nếu có sự cố"],
  },
];

// Hàm helper để lấy class màu sắc dựa trên theme
const getThemeStyles = (theme: ThemeColor) => {
  switch (theme) {
    case "blue":
      return {
        bar: "bg-blue-600",
        headerBg: "bg-blue-50",
        titleText: "text-blue-800",
        capacityBadge: "bg-blue-100 text-blue-700",
        bulletIcon: "text-blue-500",
      };
    case "green":
      return {
        bar: "bg-green-600",
        headerBg: "bg-green-50",
        titleText: "text-green-800",
        capacityBadge: "bg-green-100 text-green-700",
        bulletIcon: "text-green-500",
      };
    case "orange": // Dùng cho các tiêu đề phụ
      return {
         bar: "bg-orange-500",
         headerBg: "bg-orange-50",
         titleText: "text-orange-800",
         capacityBadge: "bg-orange-100 text-orange-700",
         bulletIcon: "text-orange-500",
      };
    case "cyan":
      return {
        bar: "bg-cyan-600",
        headerBg: "bg-cyan-50",
        titleText: "text-cyan-800",
        capacityBadge: "bg-cyan-100 text-cyan-700",
        bulletIcon: "text-cyan-500",
      };
    default:
      return {
        bar: "bg-gray-600",
        headerBg: "bg-gray-50",
        titleText: "text-gray-800",
        capacityBadge: "bg-gray-100 text-gray-700",
        bulletIcon: "text-gray-500",
      };
  }
};


const Details = () => {
  return (
    // Sử dụng nền gradient nhẹ thay vì gray-100 phẳng
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <Header />
      <main className="container mx-auto py-12 px-4 md:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            Thông tin chi tiết <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Phòng & Thiết bị</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tra cứu nhanh danh sách phòng, trang thiết bị hiện có và các nội quy sử dụng cần lưu ý.
          </p>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
          {rooms.map((room, i) => {
            const styles = getThemeStyles(room.theme);
            return (
              <Card
                key={i}
                // Thêm overflow-hidden để bo góc cho thanh màu trên cùng
                // Hiệu ứng hover nổi lên (hover:-translate-y-1)
                className="border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] transition-all duration-300 bg-white rounded-xl overflow-hidden group hover:-translate-y-1"
              >
                {/* Thanh màu tạo điểm nhấn trên cùng */}
                <div className={`h-2 w-full ${styles.bar}`}></div>

                <CardHeader className={`${styles.headerBg} border-b border-slate-100 pb-4 pt-5`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className={`text-2xl font-bold flex items-center gap-2 ${styles.titleText}`}>
                        {room.icon}
                        {room.name}
                      </CardTitle>
                      {/* Badge cho sức chứa */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${styles.capacityBadge}`}>
                        Sức chứa: {room.capacity}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Phần thiết bị */}
                  <div>
                    <h4 className="font-bold text-orange-700 mb-3 uppercase text-sm tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Thiết bị hỗ trợ
                    </h4>
                    <ul className="space-y-2 pl-1">
                      {room.equipment.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700 text-[15px]">
                          {/* Icon dấu tích màu theo theme */}
                          <CheckCircle2 className={`w-5 h-5 ${styles.bulletIcon} flex-shrink-0 mt-0.5`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phần nội quy */}
                  <div>
                     <h4 className="font-bold text-slate-700 mb-3 uppercase text-sm tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-slate-500" /> Nội quy sử dụng
                    </h4>
                    <ul className="space-y-2 pl-1">
                      {room.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm italic bg-slate-50 p-2 rounded-md border border-slate-100">
                          {/* Icon chấm than màu đỏ cam nhẹ */}
                          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Details;