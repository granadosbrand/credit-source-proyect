'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import { APPLICATION_STATUSES } from '@/lib/constants';
import { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

/**
 * StatusBadge - Muestra el estado de una solicitud con color apropiado
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    const statusConfig = APPLICATION_STATUSES[status];

    if (!statusConfig) {
        return <Badge className={className}>Desconocido</Badge>;
    }

    const variantMap: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
    > = {
        secondary: 'secondary',
        default: 'default',
        warning: 'warning',
        success: 'success',
        destructive: 'destructive',
        outline: 'outline',
    };

    const badge = statusConfig.badge as string;
    const variant = (variantMap[badge] || 'default') as
        | 'default'
        | 'secondary'
        | 'destructive'
        | 'outline'
        | 'success'
        | 'warning'
        | 'info';

    return (
        <Badge variant={variant} className={cn('capitalize', className)}>
            {statusConfig.label}
        </Badge>
    );
}
