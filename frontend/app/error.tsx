'use client';

import React from 'react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold">¡Algo salió mal!</h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    {error.message || 'Ocurrió un error inesperado al procesar tu solicitud'}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={reset}>Intentar de nuevo</Button>
                    <Link href={ROUTES.HOME}>
                        <Button variant="outline">Ir al inicio</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
