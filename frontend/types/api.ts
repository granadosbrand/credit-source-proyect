/**
 * API request/response types
 */

import {
    CreditApplication,
    CreateCreditApplicationDto,
    UpdateApplicationStatusDto,
    ApplicationFilters,
    CreditApplicationResponseDto,
} from './application';
import { PaginatedResponse } from './common';

export type { CreateCreditApplicationDto } from './application';

// Auth types
export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    username: string;
    role: UserRole;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface RegisterRequest {
    username: string;
    password: string;
    role: UserRole;
}

export interface LoginRequest {
    username: string;
    password: string;
}

// Request payloads
export interface CreateApplicationRequest extends CreateCreditApplicationDto { }

export interface UpdateStatusRequest extends UpdateApplicationStatusDto { }

// Response types
export interface CreateApplicationResponse extends CreditApplicationResponseDto { }

export interface GetApplicationResponse extends CreditApplicationResponseDto { }

export interface GetApplicationsResponse
    extends PaginatedResponse<CreditApplicationResponseDto> { }

export interface UpdateStatusResponse extends CreditApplicationResponseDto { }

// API Client options
export interface ApiClientOptions {
    baseURL?: string;
    timeout?: number;
}

