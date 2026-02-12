'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui';
import { ApplicationStatus } from '@/types';
import { APPLICATION_STATUSES, FIELD_LENGTHS } from '@/lib/constants';
import { updateApplicationStatusSchema, UpdateApplicationStatusFormData } from '@/lib/validations';
import { AlertCircle, Loader2 } from 'lucide-react';

interface StatusChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: UpdateApplicationStatusFormData) => Promise<void>;
    isLoading?: boolean;
    availableStatuses: ApplicationStatus[];
}

/**
 * StatusChangeModal - Modal para cambiar el estado de una solicitud
 */
export function StatusChangeModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    availableStatuses,
}: StatusChangeModalProps) {
    const [error, setError] = useState<string>('');

    const form = useForm<UpdateApplicationStatusFormData>({
        resolver: zodResolver(updateApplicationStatusSchema),
        defaultValues: {
            status: undefined,
            rejectionReason: '',
        },
        mode: 'onChange',
    });

    const selectedStatus = form.watch('status');
    const isRejectionStatus =
        selectedStatus === ApplicationStatus.REJECTED ||
        selectedStatus === ApplicationStatus.REVIEW_REQUIRED;

    const handleSubmit = async (data: UpdateApplicationStatusFormData) => {
        try {
            setError('');
            await onConfirm(data);
            form.reset();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cambiar estado');
        }
    };

    if (!isOpen) return null;

    // Overlay de fondo para cerrar
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle>Cambiar Estado de Solicitud</CardTitle>
                    <CardDescription>
                        Selecciona el nuevo estado para esta solicitud de crédito
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Estado */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nuevo Estado *</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={isLoading}
                                            >
                                                <option value="">Selecciona un estado</option>
                                                {availableStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {APPLICATION_STATUSES[status]?.label || status}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Razón de Rechazo (solo si aplica) */}
                            {isRejectionStatus && (
                                <FormField
                                    control={form.control}
                                    name="rejectionReason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Razón de {selectedStatus === ApplicationStatus.REJECTED ? 'Rechazo' : 'Revisión'} *
                                            </FormLabel>
                                            <FormControl>
                                                <textarea
                                                    placeholder="Explica la razón del rechazo o revisión requerida..."
                                                    className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                    {...field}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <div className="text-xs text-muted-foreground">
                                                {field.value?.length || 0} / {FIELD_LENGTHS.MAX_REASON} caracteres
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Confirmación del cambio */}
                            {selectedStatus && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <p className="text-sm text-blue-900">
                                        <strong>Cambio:</strong> El estado será actualizado a{' '}
                                        <strong>{APPLICATION_STATUSES[selectedStatus]?.label}</strong>
                                    </p>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !selectedStatus}
                                    className="flex-1"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Cambiando...
                                        </>
                                    ) : (
                                        'Cambiar Estado'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
