import { Logger, Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { QueueJobData } from '../interfaces/queue-job.interface';

let auditQueue: Queue;

@Injectable()
export class AuditProcessor {
    private readonly logger = new Logger(AuditProcessor.name);
    private worker: Worker;

    constructor() {
        this.initializeQueue();
    }

    private initializeQueue() {
        const redis = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };

        auditQueue = new Queue('audit', { connection: redis });
        this.worker = new Worker('audit', async (job: Job) => {
            return this.handleAudit(job);
        }, { connection: redis });
    }

    async handleAudit(job: Job<QueueJobData>) {
        const { application_id, old_status, new_status, timestamp } = job.data;

        this.logger.log(
            `[AUDIT START] App ${application_id}: ${old_status} → ${new_status}`,
        );

        await this.delay(1000);

        this.logger.log(
            `[AUDIT COMPLETE] App ${application_id} audit logged`,
        );

        return {
            success: true,
            application_id,
            logged_at: new Date(),
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getQueue() {
        return auditQueue;
    }
}
