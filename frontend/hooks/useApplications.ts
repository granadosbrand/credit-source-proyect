/**
 * Hook for fetching and managing credit applications list
 */

import { useQuery } from '@tanstack/react-query';
import { getApplications } from '@/lib/api/applications';
import { ApplicationFilters, CreditApplicationResponseDto } from '@/types';

interface UseApplicationsOptions {
    filters?: ApplicationFilters;
    enabled?: boolean;
}

export function useApplications(options?: UseApplicationsOptions) {
    const { filters, enabled = true } = options || {};

    const query = useQuery({
        queryKey: ['applications', filters],
        queryFn: () => getApplications(filters),
        enabled,
    });

    return {
        applications: query.data?.data || [],
        total: query.data?.total || 0,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
