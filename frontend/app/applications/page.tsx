'use client';

import React, { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { useMutations } from '@/hooks/useMutations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { ApplicationTable, CountrySelector, StatusBadge } from '@/components/applications';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { LoadingSpinner, ErrorDisplay, ConnectionStatus } from '@/components/shared';
import { APPLICATION_STATUSES, ROUTES, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { ApplicationStatus, Country } from '@/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationsPage() {
    const [country, setCountry] = useState<Country | undefined>();
    const [status, setStatus] = useState<ApplicationStatus | undefined>();
    const [offset, setOffset] = useState(0);

    // Enable real-time updates
    const { isConnected } = useRealtimeUpdates();

    const { applications, total, isLoading, isError, error, refetch } = useApplications({
        filters: {
            country,
            status,
            limit: DEFAULT_PAGE_SIZE,
            offset,
        },
    });

    const { deleteApplication, isDeleting } = useMutations();

    const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);
    const currentPage = Math.floor(offset / DEFAULT_PAGE_SIZE) + 1;

    const handlePrevPage = () => {
        if (offset >= DEFAULT_PAGE_SIZE) {
            setOffset(offset - DEFAULT_PAGE_SIZE);
        }
    };

    const handleNextPage = () => {
        if (offset + DEFAULT_PAGE_SIZE < total) {
            setOffset(offset + DEFAULT_PAGE_SIZE);
        }
    };

    const handleResetFilters = () => {
        setCountry(undefined);
        setStatus(undefined);
        setOffset(0);
    };

    const handleDelete = (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
            return;
        }
        deleteApplication(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Solicitudes de Crédito</h1>
                    <p className="text-muted-foreground mt-1">Gestiona y revisa todas tus solicitudes</p>
                </div>
                <Link href={ROUTES.APPLICATION_NEW}>
                    <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Nueva Solicitud</span>
                    </Button>
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-card rounded-lg shadow-sm border p-4 space-y-4">
                <h3 className="font-semibold text-sm">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium block mb-2">País</label>
                        <CountrySelector value={country} onChange={setCountry} />
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-2">Estado</label>
                        <Select value={status || 'ALL'} onValueChange={(val) => setStatus(val === 'ALL' ? undefined : (val as ApplicationStatus))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los estados</SelectItem>
                                {Object.entries(APPLICATION_STATUSES).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button variant="outline" onClick={handleResetFilters} className="w-full">
                            Limpiar Filtros
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {isLoading ? (
                <LoadingSpinner />
            ) : isError ? (
                <ErrorDisplay error={error} onRetry={() => refetch()} />
            ) : (
                <>
                    <ApplicationTable
                        applications={applications}
                        isLoading={isLoading}
                        onDelete={handleDelete}
                    />

                    {/* Paginación */}
                    {total > 0 && (
                        <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {applications.length > 0 ? offset + 1 : 0} -{' '}
                                {Math.min(offset + DEFAULT_PAGE_SIZE, total)} de {total} solicitudes
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevPage}
                                    disabled={offset === 0}
                                >
                                    Anterior
                                </Button>
                                <span className="text-sm font-medium px-3 py-1 min-w-20 text-center">
                                    {currentPage} de {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={offset + DEFAULT_PAGE_SIZE >= total}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* WebSocket Connection Status */}
            <ConnectionStatus />
        </div>
    );
}
