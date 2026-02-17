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
import { EmptyState, LoadingSkeleton } from '@/components/shared/LoadingStates';
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

    // Show skeleton loaders while loading
    const rows = isLoading ? Array(5).fill(null) : applications;

    return (
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nombre</TableHead>
                        <TableHead className="font-semibold">País</TableHead>
                        <TableHead className="font-semibold text-right">Monto Solicitado</TableHead>
                        {/* <TableHead className="font-semibold text-right">Ingreso Mensual</TableHead> */}
                        <TableHead className="font-semibold">Estado</TableHead>
                        <TableHead className="font-semibold">Fecha de Creación</TableHead>
                        <TableHead className="font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((app, index) => (
                        isLoading ? (
                            <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell><LoadingSkeleton className="h-4 w-24" /></TableCell>
                                <TableCell><LoadingSkeleton className="h-4 w-12" /></TableCell>
                                <TableCell><LoadingSkeleton className="h-4 w-20 ml-auto" /></TableCell>
                                {/* <TableCell><LoadingSkeleton className="h-4 w-20 ml-auto" /></TableCell> */}
                                <TableCell><LoadingSkeleton className="h-6 w-24" /></TableCell>
                                <TableCell><LoadingSkeleton className="h-4 w-24" /></TableCell>
                                <TableCell><LoadingSkeleton className="h-4 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ) : (
                            <TableRow key={app!.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">{app!.fullName}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {app!.country}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(app!.amountRequested)}
                                </TableCell>
                                {/* <TableCell className="text-right font-medium">
                                    {formatCurrency(app!.monthlyIncome)}
                                </TableCell> */}
                                <TableCell>
                                    <StatusBadge status={app!.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(app!.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/applications/${app!.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Ver detalle"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(app!.id)}
                                                title="Eliminar"
                                                className="h-8 w-8 p-0"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
