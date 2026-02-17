/**
 * Axios HTTP Client instance
 * Configured with base URL, timeout, and interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/constants';
import { ErrorResponse } from '@/types';

class ApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                return this.handleError(error);
            }
        );
    }

    private handleError(error: AxiosError<ErrorResponse>) {
        if (!error.response) {
            // Network error
            const networkError = new Error(`Network error: ${error.message}`);
            return Promise.reject(networkError);
        }

        const { status, data } = error.response;

        if (status === 401) {
            // Unauthorized - clear token and redirect to login
            this.clearAuthToken();
            // Could redirect to login page here
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }

        if (status === 403) {
            // Forbidden
            const forbiddenError = new Error('No tienes permiso para acceder a este recurso');
            return Promise.reject(forbiddenError);
        }

        if (status === 404) {
            const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
            const notFoundError = new Error(message || 'Recurso no encontrado');
            return Promise.reject(notFoundError);
        }

        if (status === 500) {
            const serverError = new Error('Error del servidor. Intenta más tarde.');
            return Promise.reject(serverError);
        }

        const message = Array.isArray(data?.message)
            ? data.message[0]
            : typeof data?.message === 'string'
                ? data.message
                : 'Ocurrió un error inesperado';

        const apiError = new Error(message);

        return Promise.reject(apiError);
    }

    private getAuthToken(): string | null {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    private clearAuthToken(): void {
        // Clear token from storage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    public getAxiosInstance(): AxiosInstance {
        return this.instance;
    }
}

export const apiClient = new ApiClient();
export default apiClient.getAxiosInstance();
