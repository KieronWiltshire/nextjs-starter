'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketIOContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketIOContext = createContext<SocketIOContextType>({
  socket: null,
  isConnected: false,
});

interface SocketIOProviderProps {
  children: ReactNode;
  accessToken?: string;
  apiUrl: string;
}

export function SocketIOProvider({ children, accessToken, apiUrl }: SocketIOProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketOptions: any = {
      transports: ['websocket'],
    };

    if (accessToken) {
      socketOptions.auth = {
        access_token: accessToken,
      };
    }

    const socketInstance = io(apiUrl, socketOptions);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [accessToken, apiUrl]);

  const value = {
    socket,
    isConnected,
  };
  return (
    <SocketIOContext.Provider value={value}>
      {children}
    </SocketIOContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketIOContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketIOProvider');
  }
  return context;
}
