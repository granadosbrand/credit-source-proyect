'use client';

import React from 'react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6">
                <h1 className="text-5xl font-bold text-gray-900">404</h1>
                <p className="text-2xl font-semibold text-gray-700">Página no encontrada</p>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                    La página que buscas no existe o ha sido movida
                </p>
                <Link href={ROUTES.HOME}>
                    <Button size="lg">Volver al inicio</Button>
                </Link>
            </div>
        </div>
    );
}
