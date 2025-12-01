import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Đặt phòng</CardTitle>
            <CardDescription>Chức năng đặt phòng đang được phát triển</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Trang này sẽ cho phép bạn đặt phòng, lab, hoặc sân trong hệ thống.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Booking;
