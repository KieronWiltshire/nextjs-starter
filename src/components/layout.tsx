'use client';

import { useSocket } from "@/providers/socketio";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();

  useEffect(() => {
    const handleAuthInfo = (data: any) => {
      console.log(data);
    };

    socket?.on('auth_info', handleAuthInfo);

    // Cleanup function to remove the event listener
    return () => {
      socket?.off('auth_info', handleAuthInfo);
    };
  }, [socket]);

  return children;
}