"use client";

import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, MapPin, School } from 'lucide-react';

const Contact = () => {
  return (
    // NỀN TẢNG: Sử dụng gradient nền và các đốm màu mờ để tạo chiều sâu "lồng lộn"
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative color blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/30 blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/30 blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-green-400/20 blur-[120px] -z-10" />

      <Header />

      <main className="container py-12 md:py-20 relative z-10">
        {/* TIÊU ĐỀ CHÍNH: Sử dụng gradient text */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Liên Hệ Với Chúng Tôi
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn tại các cơ sở đào tạo.
          </p>
        </div>

        {/* GRID LAYOUT: Chia các campus thành các thẻ riêng biệt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* CAMPUS 1 CARD - Nhấn mạnh màu Xanh Dương & Cam (Công nghệ) */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-blue-100/50 bg-white/80 backdrop-blur-sm overflow-hidden relative">
            {/* Thanh màu trang trí trên đầu thẻ */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-orange-500" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 size={24} />
                </div>
                <CardTitle className="text-2xl text-blue-800">Campus 1 - Công nghệ cao</CardTitle>
              </div>
              <CardDescription>Trung tâm công nghệ và đổi mới sáng tạo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                <p>Khu Công nghệ cao, Quận 9, TP.HCM</p>
              </div>
              <div className="flex items-center gap-3 text-slate-700 group/link hover:text-blue-600 transition-colors cursor-pointer">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="font-medium">campus1@fpt.edu.vn</p>
              </div>
            </CardContent>
          </Card>

          {/* CAMPUS 2 CARD - Nhấn mạnh màu Xanh Lá & Xanh Dương (Văn hóa/Môi trường) */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-green-100/50 bg-white/80 backdrop-blur-sm overflow-hidden relative">
             {/* Thanh màu trang trí trên đầu thẻ */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <School size={24} />
                </div>
                <CardTitle className="text-2xl text-green-800">Campus 2 - Nhà văn hóa</CardTitle>
              </div>
              <CardDescription>Không gian văn hóa và trải nghiệm sinh viên.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                <p>Nhà Văn hóa Sinh viên, Dĩ An, TP.HCM (Bình Dương)</p>
              </div>
               <div className="flex items-center gap-3 text-slate-700 group/link hover:text-green-600 transition-colors cursor-pointer">
                <Mail className="w-5 h-5 text-green-500 shrink-0" />
                <p className="font-medium">campus2@fpt.edu.vn</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Contact;