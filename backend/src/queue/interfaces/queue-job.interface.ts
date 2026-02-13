export interface QueueJobData {
    application_id: string;
    old_status?: string;
    new_status: string;
    country: string;
    risk_score?: number;
    timestamp: Date;
}
