/**
 * Error handling utilities
 */

import { AxiosError } from 'axios';
import { ErrorResponse } from '@/types';

/**
 * Get error message from different error types
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Ocurrió un error inesperado';
}

/**
 * Check if error is axios error
 */
export function isAxiosError(error: unknown): error is AxiosError<ErrorResponse> {
    return error instanceof AxiosError;
}

/**
 * Get API error message
 */
export function getApiErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        if (error.response?.data?.message) {
            const message = error.response.data.message;
            return Array.isArray(message) ? message[0] : message;
        }
        return error.message;
    }

    return getErrorMessage(error);
}

/**
 * Handle API errors with logging (if needed)
 */
export function handleApiError(error: unknown): never {
    const message = getApiErrorMessage(error);

    // Could add logging here
    console.error('[API Error]:', message);

    throw new Error(message);
}

/**
 * Retry logic for API calls
 */
export async function retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
}
