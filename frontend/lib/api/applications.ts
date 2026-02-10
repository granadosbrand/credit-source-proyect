/**
 * Credit Applications API endpoints
 */

import axiosInstance from './client';
import {
    CreateApplicationRequest,
    CreateApplicationResponse,
    GetApplicationResponse,
    GetApplicationsResponse,
    UpdateStatusRequest,
    UpdateStatusResponse,
} from '@/types/api';
import { ApplicationFilters } from '@/types';

/**
 * Create a new credit application
 */
export const createApplication = async (
    data: CreateApplicationRequest
): Promise<CreateApplicationResponse> => {
    const response = await axiosInstance.post('/api/credit-applications', data);
    return response.data;
};

/**
 * Get all credit applications with optional filters
 */
export const getApplications = async (filters?: ApplicationFilters): Promise<GetApplicationsResponse> => {
    const params = {
        ...(filters?.country && { country: filters.country }),
        ...(filters?.status && { status: filters.status }),
        limit: filters?.limit || 20,
        offset: filters?.offset || 0,
    };

    const response = await axiosInstance.get('/api/credit-applications', { params });
    return response.data;
};

/**
 * Get a single credit application by ID
 */
export const getApplication = async (id: string): Promise<GetApplicationResponse> => {
    const response = await axiosInstance.get(`/api/credit-applications/${id}`);
    return response.data;
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
    id: string,
    data: UpdateStatusRequest
): Promise<UpdateStatusResponse> => {
    const response = await axiosInstance.patch(
        `/api/credit-applications/${id}/status`,
        data
    );
    return response.data;
};

/**
 * Delete a credit application (if backend supports it)
 */
export const deleteApplication = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/credit-applications/${id}`);
};
