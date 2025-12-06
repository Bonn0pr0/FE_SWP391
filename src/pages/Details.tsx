"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const rooms = [
  {
    name: "Meeting Room",
    capacity: "10–20 người",
    equipment: [
      "Máy chiếu hoặc TV",
      "Hệ thống âm thanh và micro",
      "Bàn họp + ghế xoay",
      "Wi-Fi, máy lạnh",
    ],
    rules: ["Đặt lịch trước", "Không gây ồn", "Không mang đồ ăn uống"],
  },
  {
    name: "Computer Lab",
    capacity: "30–50 máy",
    equipment: [
      "Máy tính học tập/lập trình",
      "Máy chiếu + màn chiếu",
      "Phần mềm bản quyền",
      "Wi-Fi tốc độ cao",
    ],
    rules: ["Không tự ý cài phần mềm", "Không ăn uống trong phòng", "Giữ vệ sinh thiết bị"],
  },
  {
    name: "Football Field",
    capacity: "Sân 5–7 người",
    equipment: ["Cỏ nhân tạo", "Đèn chiếu sáng", "Ghế cầu thủ"],
    rules: ["Đặt lịch trước", "Giày phù hợp", "Không xả rác"],
  },
  {
    name: "Lecture Hall",
    capacity: "80–200 người",
    equipment: ["Âm thanh + micro", "Máy chiếu + màn chiếu", "Camera trực tuyến"],
    rules: ["Giữ im lặng", "Không đổi vị trí thiết bị", "Báo sự cố ngay"],
  },
];

const Details = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Thông tin chi tiết phòng</h1>
          <p className="text-gray-600">
            Danh sách phòng – thiết bị – nội quy sử dụng
          </p>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room, i) => (
            <Card
              key={i}
              className="shadow-md border hover:shadow-xl transition p-2 bg-white rounded-lg"
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {room.name}
                </CardTitle>
                <CardDescription>Sức chứa: {room.capacity}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Thiết bị hỗ trợ:</h4>
                  <ul className="list-disc ml-6 text-sm text-gray-600">
                    {room.equipment.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">Nội quy:</h4>
                  <ul className="list-disc ml-6 text-sm text-gray-600">
                    {room.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Details;
