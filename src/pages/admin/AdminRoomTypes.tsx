import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomTypeManager } from '@/components/RoomTypeManager';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AdminRoomTypes = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý loại phòng</h1>
          <p className="text-muted-foreground">Danh sách các loại phòng trong hệ thống</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RoomTypeManager />
        </CardContent>
      </Card>
    </div>
  );
};