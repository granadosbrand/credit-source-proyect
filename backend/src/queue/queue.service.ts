import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

export interface QueueJobData {
    application_id: string;
    full_name?: string;
    country?: string;
    risk_score?: number;
    status?: string;
    action?: string;
}

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);
    private redisConnection: IORedis;

    // Queue instances
    public riskQueue: Queue;
    public auditQueue: Queue;
    public notificationQueue: Queue;

    private workers: Worker[] = [];

    constructor() {
        this.initializeRedis();
        this.initializeQueues();
        this.initializeWorkers();
    }

    private initializeRedis() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            maxRetriesPerRequest: null,
        };

        this.redisConnection = new IORedis(redisConfig);
        this.logger.log(
            `Redis connection initialized: ${redisConfig.host}:${redisConfig.port}`,
        );
    }

    private initializeQueues() {
        const connection = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };

        this.riskQueue = new Queue('risk-evaluation', { connection });
        this.auditQueue = new Queue('audit', { connection });
        this.notificationQueue = new Queue('notification', { connection });

        this.logger.log('BullMQ queues initialized: risk-evaluation, audit, notification');
    }

    private initializeWorkers() {
        const connection = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };

        // Risk Evaluation Worker
        const riskWorker = new Worker(
            'risk-evaluation',
            this.handleRiskEvaluation.bind(this),
            { connection },
        );

        riskWorker.on('completed', (job) => {
            if (job) {
                this.logger.log(`[RISK COMPLETE] Job ${job.id} completed`);
            }
        });

        riskWorker.on('failed', (job, err) => {
            if (job) {
                this.logger.error(`[RISK FAILED] Job ${job.id} failed:`, err.message);
            }
        });

        this.workers.push(riskWorker);

        // Audit Worker
        const auditWorker = new Worker(
            'audit',
            this.handleAudit.bind(this),
            { connection },
        );

        auditWorker.on('completed', (job) => {
            if (job) {
                this.logger.log(`[AUDIT COMPLETE] Job ${job.id} completed`);
            }
        });

        auditWorker.on('failed', (job, err) => {
            if (job) {
                this.logger.error(`[AUDIT FAILED] Job ${job.id} failed:`, err.message);
            }
        });

        this.workers.push(auditWorker);

        // Notification Worker
        const notificationWorker = new Worker(
            'notification',
            this.handleNotification.bind(this),
            { connection },
        );

        notificationWorker.on('completed', (job) => {
            if (job) {
                this.logger.log(`[NOTIFICATION COMPLETE] Job ${job.id} completed`);
            }
        });

        notificationWorker.on('failed', (job, err) => {
            if (job) {
                this.logger.error(
                    `[NOTIFICATION FAILED] Job ${job.id} failed:`,
                    err.message,
                );
            }
        });

        this.workers.push(notificationWorker);

        this.logger.log('BullMQ workers initialized');
    }

    // Job enqueueing methods
    async enqueueRiskEvaluation(data: QueueJobData) {
        await this.riskQueue.add('evaluate', data, {
            delay: 1000, // Start after 1 second
            priority: 10,
        });
        this.logger.log(
            `[RISK ENQUEUED] Application ${data.application_id} queued for risk evaluation`,
        );
    }

    async enqueueAudit(data: QueueJobData) {
        await this.auditQueue.add('log', data, {
            delay: 1000,
            priority: 5,
        });
        this.logger.log(
            `[AUDIT ENQUEUED] Application ${data.application_id} queued for audit`,
        );
    }

    async enqueueNotification(data: QueueJobData) {
        await this.notificationQueue.add('send', data, {
            delay: 5000,
            priority: 8,
        });
        this.logger.log(
            `[NOTIFICATION ENQUEUED] Application ${data.application_id} queued for notification`,
        );
    }

    // Worker handlers
    private async handleRiskEvaluation(
        job: Job<QueueJobData>,
    ): Promise<{ success: boolean; riskLevel?: string }> {
        const { application_id, risk_score = 0 } = job.data;

        this.logger.log(`[RISK START] Evaluating app ${application_id}, score: ${risk_score}`);

        // Realistic 3-5 second delay for risk evaluation
        const processingTime = 3000 + Math.random() * 2000;
        await this.delay(processingTime);

        const riskLevel = risk_score >= 70 ? 'low' : risk_score >= 50 ? 'medium' : 'high';

        this.logger.log(
            `[RISK COMPLETE] App ${application_id} evaluated as ${riskLevel} (took ${processingTime}ms)`,
        );

        return { success: true, riskLevel };
    }

    private async handleAudit(
        job: Job<QueueJobData>,
    ): Promise<{ success: boolean; logged: boolean }> {
        const { application_id, action, status } = job.data;

        this.logger.log(
            `[AUDIT START] Logging action for app ${application_id}: ${action} → ${status}`,
        );

        // 1 second audit log delay
        await this.delay(1000);

        this.logger.log(`[AUDIT COMPLETE] App ${application_id} action logged`);

        return { success: true, logged: true };
    }

    private async handleNotification(
        job: Job<QueueJobData>,
    ): Promise<{ success: boolean; sent: boolean }> {
        const { application_id, full_name, status } = job.data;

        this.logger.log(`[NOTIFICATION START] Sending notification for ${full_name} (app ${application_id})`);

        // 2 second notification delay
        await this.delay(2000);

        this.logger.log(
            `[NOTIFICATION COMPLETE] Notification sent for app ${application_id} (status: ${status})`,
        );

        return { success: true, sent: true };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async onModuleDestroy() {
        this.logger.log('Closing workers and Redis connections');
        for (const worker of this.workers) {
            await worker.close();
        }
        await this.redisConnection.quit();
    }
}
