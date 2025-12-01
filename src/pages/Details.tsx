import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Details = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết</CardTitle>
            <CardDescription>Thông tin chi tiết về hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Trang này sẽ hiển thị thông tin chi tiết về phòng, thiết bị và quy định.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Details;
