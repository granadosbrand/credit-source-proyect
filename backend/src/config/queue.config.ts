export const getQueueConfig = () => ({
    connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential' as const,
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});
