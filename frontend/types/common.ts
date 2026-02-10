/**
 * Common types and utilities for the application
 */

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit?: number;
    offset?: number;
}

export interface ErrorResponse {
    message: string | string[];
    error: string;
    statusCode: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}
