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
