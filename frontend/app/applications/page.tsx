'use client';

import React, { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { ApplicationTable, CountrySelector, StatusBadge } from '@/components/applications';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { LoadingSpinner, ErrorDisplay } from '@/components/shared';
import { APPLICATION_STATUSES, ROUTES, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { ApplicationStatus, Country } from '@/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ApplicationsPage() {
    const [country, setCountry] = useState<Country | undefined>();
    const [status, setStatus] = useState<ApplicationStatus | undefined>();
    const [offset, setOffset] = useState(0);

    const { applications, total, isLoading, isError, error, refetch } = useApplications({
        filters: {
            country,
            status,
            limit: DEFAULT_PAGE_SIZE,
            offset,
        },
    });

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Solicitudes de Crédito</h1>
                <Link href={ROUTES.APPLICATION_NEW}>
                    <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Nueva Solicitud</span>
                    </Button>
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <h3 className="font-semibold">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium">País</label>
                        <CountrySelector value={country} onChange={setCountry} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Estado</label>
                        <Select value={status} onValueChange={(val) => setStatus(val as ApplicationStatus)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent>
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
                    <ApplicationTable applications={applications} />

                    {/* Paginación */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {applications.length > 0 ? offset + 1 : 0} -{' '}
                            {Math.min(offset + DEFAULT_PAGE_SIZE, total)} de {total} solicitudes
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={handlePrevPage}
                                disabled={offset === 0}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm">
                                Página {currentPage} de {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={offset + DEFAULT_PAGE_SIZE >= total}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
