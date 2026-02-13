'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { createWebSocket, WS_EVENTS } from '@/lib/websocket';

interface WebSocketContextValue {
    socket: Socket | null;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({
    socket: null,
    isConnected: false,
});

/**
 * Hook to access WebSocket context
 */
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}

interface WebSocketProviderProps {
    children: ReactNode;
}

/**
 * WebSocketProvider - Manages global WebSocket connection
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create WebSocket connection
        const ws = createWebSocket();

        // Connection event handlers
        ws.on(WS_EVENTS.CONNECT, () => {
            console.log('[WebSocket] Connected');
            setIsConnected(true);
        });

        ws.on(WS_EVENTS.DISCONNECT, (reason) => {
            console.log('[WebSocket] Disconnected:', reason);
            setIsConnected(false);
        });

        ws.on(WS_EVENTS.CONNECT_ERROR, (error) => {
            console.error('[WebSocket] Connection error:', error);
            setIsConnected(false);
        });

        setSocket(ws);

        // Cleanup on unmount
        return () => {
            console.log('[WebSocket] Cleaning up connection');
            ws.disconnect();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
}
