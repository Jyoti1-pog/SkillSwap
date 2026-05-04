import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import useUIStore from '../store/uiStore';
import useAuthStore from '../store/authStore';

export const useSocket = () => {
  const { incrementNotifications, incrementMessages } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = () => incrementNotifications();
    const handleMessage = () => incrementMessages();

    socket.on('notification', handleNotification);
    socket.on('message_notification', handleMessage);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('message_notification', handleMessage);
    };
  }, [isAuthenticated]);
};
