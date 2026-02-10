/**
 * Hook for fetching a single credit application
 */

import { useQuery } from '@tanstack/react-query';
import { getApplication } from '@/lib/api/applications';

interface UseApplicationOptions {
    enabled?: boolean;
}

export function useApplication(id: string, options?: UseApplicationOptions) {
    const { enabled = true } = options || {};

    const query = useQuery({
        queryKey: ['applications', id],
        queryFn: () => getApplication(id),
        enabled: enabled && !!id,
    });

    return {
        application: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
