import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, BarChart3, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container py-20 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            FPTU HCM Multi-campus
            <br />
            <span className="text-primary">Facility Booking System</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hệ thống đặt phòng thông minh cho sinh viên và giảng viên FPTU HCM. 
            Quản lý và đặt phòng học, phòng họp, lab và sân vận động dễ dàng.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link to="/login">Bắt đầu ngay</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/details">Tìm hiểu thêm</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Đặt phòng dễ dàng</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Xem lịch trống và đặt phòng chỉ với vài cú click
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Đa campus</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hỗ trợ Campus 1 (Công nghệ cao) và Campus 2 (Nhà văn hóa)
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Báo cáo chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Thống kê và báo cáo sử dụng phòng theo thời gian thực
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Bảo mật cao</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Xác thực bằng email FPTU, phân quyền rõ ràng
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <div className="text-muted-foreground">Campus</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Phòng & Sân</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Người dùng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 FPTU HCM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
