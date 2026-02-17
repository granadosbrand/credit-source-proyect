'use client';

import React, { use } from 'react';
import { useApplication } from '@/hooks/useApplication';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useAuthStore } from '@/store/authStore';
import { ApplicationCard } from '@/components/applications';
import { Button } from '@/components/ui';
import { LoadingSpinner, ErrorDisplay } from '@/components/shared';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

interface ApplicationDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ApplicationDetailPage(props: ApplicationDetailPageProps) {
    const params = use(props.params);
    const { id } = params;
    const { user } = useAuthStore();

    // Enable real-time updates for this specific application
    useRealtimeUpdates();

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
                userRole={user?.role}
            />
        </div>
    );
}
