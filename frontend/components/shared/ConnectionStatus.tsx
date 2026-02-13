'use client';

import React from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { Badge } from '@/components/ui';

/**
 * ConnectionStatus - Displays WebSocket connection status
 */
export function ConnectionStatus() {
    const { isConnected } = useWebSocket();

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Badge 
                variant={isConnected ? 'default' : 'destructive'}
                className="shadow-lg"
            >
                {isConnected ? (
                    <>
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        En vivo
                    </>
                ) : (
                    <>
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
                        Desconectado
                    </>
                )}
            </Badge>
        </div>
    );
}
