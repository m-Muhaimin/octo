import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, User, AlertTriangle } from "lucide-react";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Notification {
  id: string;
  type: 'appointment' | 'patient' | 'alert' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Brooklyn Simmons has an appointment in 30 minutes',
      time: '2 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'patient',
      title: 'New Patient Registration',
      message: 'Jenny Wilson has been successfully registered',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'alert',
      title: 'Lab Results Ready',
      message: 'Lab results for Anthony Johnson are ready for review',
      time: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'System Update',
      message: 'The system will undergo maintenance at midnight',
      time: '1 day ago',
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'patient':
        return <User className="w-4 h-4 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${
                        notification.read ? 'text-text-secondary' : 'text-text-primary'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-text-secondary mt-2">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
          <Button size="sm">
            View all
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}