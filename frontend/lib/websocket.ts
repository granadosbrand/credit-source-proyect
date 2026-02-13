/**
 * WebSocket client configuration and types
 */

import { io, Socket } from 'socket.io-client';

// WebSocket URL from environment or default to localhost
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

/**
 * Event payload when application status changes
 */
export type StatusChangeEvent = {
    applicationId: string;
    oldStatus?: string;
    newStatus: string;
    country?: string;
    riskScore?: number;
    timestamp?: string;
};

/**
 * WebSocket event names
 */
export const WS_EVENTS = {
    STATUS_CHANGED: 'credit-application.status-changed',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
} as const;

/**
 * Create and configure WebSocket connection
 */
export function createWebSocket(): Socket {
    const socket = io(WS_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ['websocket', 'polling'],
    });

    return socket;
}

/**
 * Get status change message for toast notifications
 */
export function getStatusChangeMessage(event: StatusChangeEvent): {
    title: string;
    description: string;
    variant: 'success' | 'error' | 'warning' | 'info';
} {
    const statusMessages: Record<string, { title: string; description: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
        APPROVED: {
            title: '✅ Solicitud Aprobada',
            description: `La solicitud ha sido aprobada exitosamente`,
            variant: 'success',
        },
        REJECTED: {
            title: '❌ Solicitud Rechazada',
            description: `La solicitud ha sido rechazada`,
            variant: 'error',
        },
        REVIEW_REQUIRED: {
            title: '⚠️ Revisión Requerida',
            description: `La solicitud requiere revisión manual`,
            variant: 'warning',
        },
        VALIDATING: {
            title: '🔄 En Validación',
            description: `La solicitud está siendo validada`,
            variant: 'info',
        },
        PENDING_VALIDATION: {
            title: '⏳ Pendiente de Validación',
            description: `La solicitud está pendiente de validación`,
            variant: 'info',
        },
    };

    return statusMessages[event.newStatus] || {
        title: '📋 Estado Actualizado',
        description: `Estado cambiado a ${event.newStatus}`,
        variant: 'info',
    };
}
