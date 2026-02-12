'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { StatusBadge } from './StatusBadge';
import { StatusChangeModal } from './StatusChangeModal';
import { CreditApplication, ApplicationStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useMutations } from '@/hooks/useMutations';
import { ChevronDown, Loader2 } from 'lucide-react';
import { UpdateApplicationStatusFormData } from '@/lib/validations';

interface ApplicationCardProps {
    application: CreditApplication;
    onUpdate?: () => void;
}

/**
 * Available status transitions based on current status
 */
function getAvailableStatusTransitions(currentStatus: ApplicationStatus): ApplicationStatus[] {
    const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
        [ApplicationStatus.DRAFT]: [ApplicationStatus.PENDING_VALIDATION],
        [ApplicationStatus.PENDING_VALIDATION]: [ApplicationStatus.VALIDATING],
        [ApplicationStatus.VALIDATING]: [
            ApplicationStatus.APPROVED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.REVIEW_REQUIRED,
        ],
        [ApplicationStatus.APPROVED]: [],
        [ApplicationStatus.REJECTED]: [],
        [ApplicationStatus.REVIEW_REQUIRED]: [ApplicationStatus.VALIDATING],
    };
    return transitions[currentStatus] || [];
}

/**
 * ApplicationCard - Tarjeta que muestra información detallada de una solicitud
 */
export function ApplicationCard({ application, onUpdate }: ApplicationCardProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        personal: true,
        financial: true,
        validation: false,
        dates: false,
    });
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // console.log("aplication en card", application)
    // console.log("result = ", Number(application.amountRequested) / Number(application.monthlyIncome))

    const { updateStatusAsync, isUpdatingStatus } = useMutations();

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const liInRatio = Number(application.monthlyIncome) > 0
        ? (Number(application.amountRequested) / Number(application.monthlyIncome)).toFixed(2)
        : 'N/A';

    const availableStatuses = getAvailableStatusTransitions(application.status);

    const handleStatusChange = async (data: UpdateApplicationStatusFormData) => {
        try {
            await updateStatusAsync({
                id: application.id,
                data,
            });
            onUpdate?.();
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            {availableStatuses.length > 0 && (
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsStatusModalOpen(true)}
                        disabled={isUpdatingStatus}
                    >
                        {isUpdatingStatus ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Actualizando...
                            </>
                        ) : (
                            'Cambiar Estado'
                        )}
                    </Button>
                </div>
            )}

            {/* Status Change Modal */}
            <StatusChangeModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleStatusChange}
                isLoading={isUpdatingStatus}
                availableStatuses={availableStatuses}
            />

            {/* Header Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{application.fullName}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                {application.documentType}: {application.documentNumber}
                            </p>
                        </div>
                        <StatusBadge status={application.status} />
                    </div>
                </CardHeader>
            </Card>

            {/* Personal Information Section */}
            <Card>
                <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection('personal')}
                >
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Información Personal</CardTitle>
                        <ChevronDown
                            className={`h-5 w-5 transition-transform ${expandedSections.personal ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </CardHeader>
                {expandedSections.personal && (
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">País</div>
                                <div className="text-base font-semibold mt-1">{application.country}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">Tipo de Documento</div>
                                <div className="text-base font-semibold mt-1">{application.documentType}</div>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Financial Information Section */}
            <Card>
                <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection('financial')}
                >
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Información Financiera</CardTitle>
                        <ChevronDown
                            className={`h-5 w-5 transition-transform ${expandedSections.financial ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </CardHeader>
                {expandedSections.financial && (
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">Monto Solicitado</div>
                                <div className="text-2xl font-bold text-blue-600 mt-1">
                                    {formatCurrency(application.amountRequested)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">Ingreso Mensual</div>
                                <div className="text-2xl font-bold text-green-600 mt-1">
                                    {formatCurrency(application.monthlyIncome)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">Ratio L/I (Préstamo/Ingreso)</div>
                                <div className="text-lg font-semibold mt-1">{liInRatio}x</div>
                            </div>
                            {application.riskScore !== undefined && (
                                <div>
                                    <div className="text-sm text-muted-foreground font-medium">Puntuación de Riesgo</div>
                                    <div className={`text-lg font-semibold mt-1 ${application.riskScore >= 70 ? 'text-red-600' :
                                            application.riskScore >= 50 ? 'text-yellow-600' :
                                                'text-green-600'
                                        }`}>
                                        {Number(application.riskScore)?.toFixed(1)} / 100
                                    </div>
                                </div>
                            )}
                        </div>
                        {application.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-md mt-4">
                                <div className="text-sm font-semibold">Razón de Rechazo</div>
                                <div className="text-sm mt-2">{application.rejectionReason}</div>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Validation Information Section */}
            {(application.countryValidation || application.bankProviderData) && (
                <Card>
                    <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSection('validation')}
                    >
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Información de Validación</CardTitle>
                            <ChevronDown
                                className={`h-5 w-5 transition-transform ${expandedSections.validation ? 'rotate-180' : ''
                                    }`}
                            />
                        </div>
                    </CardHeader>
                    {expandedSections.validation && (
                        <CardContent className="space-y-4">
                            {application.countryValidation && (
                                <div>
                                    <div className="text-sm font-semibold mb-2">Validación de País</div>
                                    <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                                        {JSON.stringify(application.countryValidation, null, 2)}
                                    </div>
                                </div>
                            )}
                            {application.bankProviderData && (
                                <div>
                                    <div className="text-sm font-semibold mb-2">Datos del Proveedor Bancario</div>
                                    <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                                        {JSON.stringify(application.bankProviderData, null, 2)}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Dates Section */}
            <Card>
                <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection('dates')}
                >
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Información de Registros</CardTitle>
                        <ChevronDown
                            className={`h-5 w-5 transition-transform ${expandedSections.dates ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </CardHeader>
                {expandedSections.dates && (
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Creado:</span>
                            <span className="font-medium text-foreground">{formatDateTime(application.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Última modificación:</span>
                            <span className="font-medium text-foreground">{formatDateTime(application.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>ID de Solicitud:</span>
                            <span className="font-mono text-xs text-foreground">{application.id}</span>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
