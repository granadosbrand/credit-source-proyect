import { Logger, Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { QueueJobData } from '../interfaces/queue-job.interface';

let notificationQueue: Queue;

@Injectable()
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);
    private worker: Worker;

    constructor() {
        this.initializeQueue();
    }

    private initializeQueue() {
        const redis = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };

        notificationQueue = new Queue('notification', { connection: redis });
        this.worker = new Worker('notification', async (job: Job) => {
            return this.handleNotification(job);
        }, { connection: redis });
    }

    async handleNotification(job: Job<QueueJobData>) {
        const { application_id, new_status, country } = job.data;

        this.logger.log(
            `[NOTIFICATION START] Sending ${new_status} notice for app ${application_id}`,
        );

        await this.delay(2000);

        this.logger.log(
            `[NOTIFICATION COMPLETE] ${new_status} notice sent for app ${application_id}`,
        );

        return {
            sent: true,
            application_id,
            notification_type: new_status,
            sent_at: new Date(),
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getQueue() {
        return notificationQueue;
    }
}
