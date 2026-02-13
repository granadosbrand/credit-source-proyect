import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueueService } from '../../queue/queue.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';

type PgStatusChangePayload = {
    application_id: string;
    old_status?: string;
    new_status: string;
    country?: string;
    amount_requested?: string | number;
    risk_score?: string | number;
    timestamp?: string;
};

@Injectable()
export class PgNotifyListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PgNotifyListenerService.name);
    private pgClient: any;

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private readonly queueService: QueueService,
        private readonly realtimeGateway: RealtimeGateway,
    ) {
    }

    async onModuleInit() {
        try {
            // Obtener cliente de PostgreSQL nativo
            this.pgClient = await (this.dataSource.driver as any).master.connect();

            // Suscribirse al canal de notificaciones
            await this.pgClient.query('LISTEN application_changes');

            this.logger.log('Listening for PostgreSQL notifications');

            // Configurar handler de notificaciones
            this.pgClient.on('notification', async (msg: any) => {
                if (msg.channel === 'application_changes') {
                    try {
                        const payload: PgStatusChangePayload = JSON.parse(msg.payload);
                        await this.handleStatusChange(payload);
                    } catch (error) {
                        this.logger.error('Error processing notification', error);
                    }
                }
            });

            // Handler de errores
            this.pgClient.on('error', (err: any) => {
                this.logger.error('PostgreSQL client error', err);
            });

        } catch (error) {
            this.logger.error('Failed to initialize pg_notify listener', error);
        }
    }

    async onModuleDestroy() {
        if (this.pgClient) {
            try {
                await this.pgClient.query('UNLISTEN application_changes');
                this.logger.log('Unsubscribed from notifications');
            } catch (error) {
                this.logger.error('Error unlistening', error);
            }
        }
    }

    private async handleStatusChange(payload: PgStatusChangePayload) {
        this.logger.log(
            `Status change: ${payload.application_id} (${payload.old_status} → ${payload.new_status})`,
        );

        const riskScore = payload.risk_score !== undefined
            ? Number(payload.risk_score)
            : undefined;

        const jobData = {
            application_id: payload.application_id,
            country: payload.country,
            risk_score: Number.isNaN(riskScore) ? undefined : riskScore,
            status: payload.new_status,
            action: `Status changed to ${payload.new_status}`,
        };

        // Auditar siempre
        await this.queueService.enqueueAudit(jobData);

        if (payload.new_status === 'VALIDATING') {
            await this.queueService.enqueueRiskEvaluation(jobData);
            this.logger.log('Risk job queued');
        }

        if (['APPROVED', 'REJECTED'].includes(payload.new_status)) {
            await this.queueService.enqueueNotification(jobData);
            this.logger.log('Notification job queued');
        }

        this.realtimeGateway.emitStatusChange({
            applicationId: payload.application_id,
            oldStatus: payload.old_status,
            newStatus: payload.new_status,
            country: payload.country,
            riskScore: Number.isNaN(riskScore) ? undefined : riskScore,
            timestamp: payload.timestamp,
        });
    }
}
