import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      
      // Create socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      // Listen for notifications
      newSocket.on('notification', (data) => {
        toast.info(data.notification.title, {
          autoClose: 5000,
          onClick: () => {
            window.location.href = '/notifications';
          },
        });
      });

      // Listen for new reports (admins only)
      if (user.role === 'admin') {
        newSocket.on('new-report', (data) => {
          toast.info('New waste report submitted', {
            autoClose: 5000,
          });
        });
      }

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};