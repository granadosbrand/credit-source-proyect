import { Logger, Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { QueueJobData } from '../interfaces/queue-job.interface';

let riskQueue: Queue;

@Injectable()
export class RiskEvaluationProcessor {
    private readonly logger = new Logger(RiskEvaluationProcessor.name);
    private worker: Worker;

    constructor() {
        this.initializeQueue();
    }

    private initializeQueue() {
        const redis = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };

        riskQueue = new Queue('risk-evaluation', { connection: redis });
        this.worker = new Worker('risk-evaluation', async (job: Job) => {
            return this.handleRiskEvaluation(job);
        }, { connection: redis });
    }

    async handleRiskEvaluation(job: Job<QueueJobData>) {
        const { application_id, risk_score = 0, country } = job.data;

        this.logger.log(
            `[RISK START] Evaluating app ${application_id} (${country}) with score ${risk_score}`,
        );

        const processingTime = 3000 + Math.random() * 2000;
        await this.delay(processingTime);

        const riskLevel =
            risk_score >= 70 ? 'low' : risk_score >= 50 ? 'medium' : 'high';

        this.logger.log(
            `[RISK COMPLETE] App ${application_id} evaluated as ${riskLevel} (${processingTime.toFixed(0)}ms)`,
        );

        return {
            evaluated: true,
            application_id,
            risk_level: riskLevel,
            processing_time_ms: processingTime,
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getQueue() {
        return riskQueue;
    }
}
