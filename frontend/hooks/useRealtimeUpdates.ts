/**
 * Hook for subscribing to real-time application updates via WebSocket
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { WS_EVENTS, StatusChangeEvent, getStatusChangeMessage } from '@/lib/websocket';
import { useRouter } from 'next/navigation';

interface UseRealtimeUpdatesOptions {
    /**
     * Whether to show toast notifications for status changes
     * @default true
     */
    showToast?: boolean;

    /**
     * Whether to auto-refresh queries when status changes
     * @default true
     */
    autoRefresh?: boolean;

    /**
     * Callback when status change event is received
     */
    onStatusChange?: (event: StatusChangeEvent) => void;
}

/**
 * Hook to listen for real-time application status changes
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
    const { showToast = true, autoRefresh = true, onStatusChange } = options;
    const { socket, isConnected } = useWebSocket();
    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        if (!socket) return;

        const handleStatusChange = (event: StatusChangeEvent) => {
            console.log('[WebSocket] Status changed:', event);

            // Call custom callback if provided
            if (onStatusChange) {
                onStatusChange(event);
            }

            // Show toast notification
            if (showToast) {
                const message = getStatusChangeMessage(event);
                
                switch (message.variant) {
                    case 'success':
                        toast.success(message.title, {
                            description: message.description,
                            action: {
                                label: 'Ver',
                                onClick: () => router.push(`/applications/${event.applicationId}`),
                            },
                        });
                        break;
                    case 'error':
                        toast.error(message.title, {
                            description: message.description,
                        });
                        break;
                    case 'warning':
                        toast.warning(message.title, {
                            description: message.description,
                        });
                        break;
                    default:
                        toast.info(message.title, {
                            description: message.description,
                        });
                }
            }

            // Auto-refresh queries to update UI
            if (autoRefresh) {
                // Invalidate the list of applications
                queryClient.invalidateQueries({ queryKey: ['applications'] });
                
                // Invalidate specific application detail
                if (event.applicationId) {
                    queryClient.invalidateQueries({ 
                        queryKey: ['applications', event.applicationId] 
                    });
                }
            }
        };

        // Subscribe to status change events
        socket.on(WS_EVENTS.STATUS_CHANGED, handleStatusChange);

        // Cleanup listener on unmount
        return () => {
            socket.off(WS_EVENTS.STATUS_CHANGED, handleStatusChange);
        };
    }, [socket, queryClient, router, showToast, autoRefresh, onStatusChange]);

    return {
        isConnected,
    };
}
