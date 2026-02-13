import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

type StatusChangeEvent = {
    applicationId: string;
    oldStatus?: string;
    newStatus: string;
    country?: string;
    riskScore?: number;
    timestamp?: string;
};

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class RealtimeGateway {
    private readonly logger = new Logger(RealtimeGateway.name);

    @WebSocketServer()
    private server?: Server;

    emitStatusChange(event: StatusChangeEvent) {
        if (!this.server) {
            this.logger.warn('WebSocket server not ready; skipping event emit');
            return;
        }

        this.server.emit('credit-application.status-changed', event);
    }
}
