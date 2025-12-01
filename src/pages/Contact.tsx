import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Liên hệ</CardTitle>
            <CardDescription>Thông tin liên hệ và hỗ trợ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Campus 1 - Công nghệ cao</h3>
                <p className="text-muted-foreground">Địa chỉ: Khu Công nghệ cao, Quận 9, TP.HCM</p>
                <p className="text-muted-foreground">Email: campus1@fpt.edu.vn</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Campus 2 - Nhà văn hóa</h3>
                <p className="text-muted-foreground">Địa chỉ: Nhà Văn hóa Sinh viên, Quận 1, TP.HCM</p>
                <p className="text-muted-foreground">Email: campus2@fpt.edu.vn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Contact;
