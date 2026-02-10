'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { CreditApplication } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ApplicationCardProps {
    application: CreditApplication;
}

/**
 * ApplicationCard - Tarjeta que muestra información detallada de una solicitud
 */
export function ApplicationCard({ application }: ApplicationCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{application.fullName}</CardTitle>
                        <CardDescription>{application.documentType}: {application.documentNumber}</CardDescription>
                    </div>
                    <StatusBadge status={application.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-muted-foreground">País</div>
                        <div className="text-lg font-medium">{application.country}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Monto Solicitado</div>
                        <div className="text-lg font-medium">{formatCurrency(application.amountRequested)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Ingreso Mensual</div>
                        <div className="text-lg font-medium">{formatCurrency(application.monthlyIncome)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Ratio L/I</div>
                        <div className="text-lg font-medium">
                            {(application.amountRequested / application.monthlyIncome).toFixed(1)}x
                        </div>
                    </div>
                </div>

                {application.riskScore !== undefined && (
                    <div>
                        <div className="text-sm text-muted-foreground">Puntuación de Riesgo</div>
                        <div className="text-lg font-medium">{application.riskScore?.toFixed(2)} / 100</div>
                    </div>
                )}

                {application.rejectionReason && (
                    <div className="bg-red-50 text-red-900 p-3 rounded-md">
                        <div className="text-sm font-medium">Razón de Rechazo</div>
                        <div className="text-sm mt-1">{application.rejectionReason}</div>
                    </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
                    <div>Creado: {formatDate(application.createdAt)}</div>
                    <div>Modificado: {formatDate(application.updatedAt)}</div>
                </div>
            </CardContent>
        </Card>
    );
}
