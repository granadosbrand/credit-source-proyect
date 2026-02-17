/**
 * Hook for subscribing to real-time application updates via WebSocket
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { WS_EVENTS, StatusChangeEvent, ApplicationCreatedEvent, getStatusChangeMessage } from '@/lib/websocket';
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

    /**
     * Callback when application is created
     */
    onApplicationCreated?: (event: ApplicationCreatedEvent) => void;
}

/**
 * Hook to listen for real-time application updates
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
    const { showToast = true, autoRefresh = true, onStatusChange, onApplicationCreated } = options;
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

        const handleApplicationCreated = (event: ApplicationCreatedEvent) => {
            console.log('[WebSocket] Application created:', event);

            // Call custom callback if provided
            if (onApplicationCreated) {
                onApplicationCreated(event);
            }

            // Show toast notification
            if (showToast) {
                toast.success('✨ Nueva Solicitud Creada', {
                    description: `${event.fullName} - ${event.country}`,
                    action: {
                        label: 'Ver',
                        onClick: () => router.push(`/applications/${event.applicationId}`),
                    },
                });
            }

            // Auto-refresh queries to update UI
            if (autoRefresh) {
                // Invalidate the list of applications (all filters)
                queryClient.invalidateQueries({ queryKey: ['applications'] });
            }
        };

        // Subscribe to both events
        socket.on(WS_EVENTS.STATUS_CHANGED, handleStatusChange);
        socket.on(WS_EVENTS.APPLICATION_CREATED, handleApplicationCreated);

        // Cleanup listeners on unmount
        return () => {
            socket.off(WS_EVENTS.STATUS_CHANGED, handleStatusChange);
            socket.off(WS_EVENTS.APPLICATION_CREATED, handleApplicationCreated);
        };
    }, [socket, queryClient, router, showToast, autoRefresh, onStatusChange, onApplicationCreated]);

    return {
        isConnected,
    };
}
