'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
} from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { CreditApplication } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/shared/LoadingStates';
import Link from 'next/link';
import { Eye, Trash2 } from 'lucide-react';

interface ApplicationTableProps {
    applications: CreditApplication[];
    isLoading?: boolean;
    onDelete?: (id: string) => void;
}

/**
 * ApplicationTable - Tabla que muestra listado de solicitudes
 */
export function ApplicationTable({
    applications,
    isLoading,
    onDelete,
}: ApplicationTableProps) {
    if (!isLoading && applications.length === 0) {
        return <EmptyState message="No hay solicitudes de crédito" />;
    }

    return (
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>País</TableHead>
                        <TableHead>Monto Solicitado</TableHead>
                        <TableHead>Ingreso Mensual</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((app) => (
                        <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.fullName}</TableCell>
                            <TableCell>{app.country}</TableCell>
                            <TableCell>{formatCurrency(app.amountRequested)}</TableCell>
                            <TableCell>{formatCurrency(app.monthlyIncome)}</TableCell>
                            <TableCell>
                                <StatusBadge status={app.status} />
                            </TableCell>
                            <TableCell>{formatDate(app.createdAt)}</TableCell>
                            <TableCell className="text-right space-x-2 flex justify-end">
                                <Link href={`/applications/${app.id}`}>
                                    <Button variant="ghost" size="sm" title="Ver detalle">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                                {onDelete && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(app.id)}
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
