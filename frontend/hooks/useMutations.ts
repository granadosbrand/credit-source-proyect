/**
 * Hook for credit application mutations (create, update, delete)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createApplication,
    updateApplicationStatus,
    deleteApplication,
} from '@/lib/api/applications';
import {
    CreateApplicationRequest,
    UpdateStatusRequest,
    CreateApplicationResponse,
    UpdateStatusResponse,
} from '@/types/api';
import { toast } from 'sonner';
import { MESSAGES } from '@/lib/constants';

export function useMutations() {
    const queryClient = useQueryClient();

    // Create application mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateApplicationRequest) => createApplication(data),
        onSuccess: () => {
            toast.success(MESSAGES.SUCCESS.CREATED);
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || MESSAGES.ERROR.CREATE_FAILED);
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
            updateApplicationStatus(id, data),
        onSuccess: (_, variables) => {
            toast.success(MESSAGES.SUCCESS.STATUS_CHANGED);
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applications', variables.id] });
        },
        onError: (error: Error) => {
            toast.error(error.message || MESSAGES.ERROR.UPDATE_FAILED);
        },
    });

    // Delete application mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteApplication(id),
        onSuccess: () => {
            toast.success(MESSAGES.SUCCESS.DELETED);
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || MESSAGES.ERROR.DELETE_FAILED);
        },
    });

    return {
        createApplication: createMutation.mutate,
        createApplicationAsync: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateStatus: updateStatusMutation.mutate,
        updateStatusAsync: updateStatusMutation.mutateAsync,
        isUpdatingStatus: updateStatusMutation.isPending,

        deleteApplication: deleteMutation.mutate,
        deleteApplicationAsync: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}

