import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import IORedis from 'ioredis';

/**
 * Redis Service - Unified client para cache, queues y otras operaciones
 * Usa ioredis directamente (sin capas de abstracción)
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private redisClient: IORedis;

    constructor() {
        this.initializeClient();
    }

    private initializeClient(): void {
        const config = {
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            maxRetriesPerRequest: null,
            retryStrategy: (times: number) => Math.min(times * 50, 2000),
        };

        this.redisClient = new IORedis(config);

        this.redisClient.on('connect', () => {
            this.logger.log(
                `Redis connected: ${config.host}:${config.port}`,
            );
        });

        this.redisClient.on('error', (err) => {
            this.logger.error(`Redis error: ${err.message}`);
        });
    }

    /**
     * Obtener valor del cache
     */
    async get<T>(key: string): Promise<T | null> {
        const value = await this.redisClient.get(key);
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            // Si no es JSON válido, retornar como string
            return value as unknown as T;
        }
    }

    /**
     * Guardar valor en cache con TTL (expiry en segundos)
     */
    async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
        const jsonValue = JSON.stringify(value);
        await this.redisClient.setex(key, ttlSeconds, jsonValue);
    }

    /**
     * Invalidar una clave
     */
    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    /**
     * Invalidar múltiples claves
     */
    async delMany(keys: string[]): Promise<void> {
        if (keys.length === 0) return;
        await this.redisClient.del(...keys);
    }

    /**
     * Invalidar todas las claves que coincidan con un patrón (ej: "credit-apps-list:*")
     * Usa SCAN para evitar bloqueos en grandes datasets
     */
    async delByPattern(pattern: string): Promise<number> {
        let cursor = '0';
        let deletedCount = 0;

        do {
            const [newCursor, keys] = await this.redisClient.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100,
            );

            cursor = newCursor;

            if (keys.length > 0) {
                deletedCount += await this.redisClient.del(...keys);
            }
        } while (cursor !== '0');

        this.logger.debug(`Deleted ${deletedCount} keys matching pattern: ${pattern}`);
        return deletedCount;
    }

    /**
     * Limpiar todo el cache (FLUSHDB)
     * ⚠️ Cuidado: Elimina TODOS los keys en la DB actual
     */
    async clear(): Promise<void> {
        await this.redisClient.flushdb();
        this.logger.warn('Redis database flushed');
    }

    /**
     * Verificar si existe una clave
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }

    /**
     * Obtener el TTL de una clave (en segundos)
     */
    async ttl(key: string): Promise<number> {
        return this.redisClient.ttl(key);
    }

    /**
     * Acceso directo al cliente para operaciones avanzadas
     */
    getClient(): IORedis {
        return this.redisClient;
    }

    /**
     * Limpiar al destruir el módulo
     */
    async onModuleDestroy(): Promise<void> {
        await this.redisClient.quit();
        this.logger.log('Redis client disconnected');
    }
}
