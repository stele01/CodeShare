import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinWorkspace: (workspaceId: string) => void;
  sendCodeUpdate: (data: CodeUpdateData) => void;
}

interface CodeUpdateData {
  workspaceId: string;
  code: string;
  language: string;
  title: string;
  access: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join a workspace room
  const joinWorkspace = (workspaceId: string) => {
    if (socket && workspaceId) {
      console.log(`Joining workspace: ${workspaceId}`);
      socket.emit('join-workspace', workspaceId);
    }
  };

  // Send code update to server
  const sendCodeUpdate = (data: CodeUpdateData) => {
    if (socket && isConnected && data.workspaceId) {
      console.log(`Sending code update for workspace: ${data.workspaceId}`);
      socket.emit('code-update', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinWorkspace,
        sendCodeUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 