'use client';

import React from 'react';
import { useApplication } from '@/hooks/useApplication';
import { ApplicationCard } from '@/components/applications';
import { Button } from '@/components/ui';
import { LoadingSpinner, ErrorDisplay } from '@/components/shared';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

interface ApplicationDetailPageProps {
    params: {
        id: string;
    };
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
    const { id } = React.use(params)
    const { application, isLoading, isError, error, refetch } = useApplication(id);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError || !application) {
        return (
            <div className="space-y-4">
                <ErrorDisplay error={error} onRetry={() => refetch()} />
                <Link href={ROUTES.APPLICATIONS}>
                    <Button variant="outline" className="flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver a solicitudes</span>
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link href={ROUTES.APPLICATIONS}>
                <Button variant="outline" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver</span>
                </Button>
            </Link>

            <ApplicationCard
                application={application}
                onUpdate={() => refetch()}
            />
        </div>
    );
}
