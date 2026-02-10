/**
 * Loading and Error components
 */

import React from 'react';

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <div className="inline-flex size-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Cargando...
                </span>
            </div>
        </div>
    );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                </div>
            ))}
        </div>
    );
}

interface ErrorDisplayProps {
    error: Error | string | null;
    onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    const message = typeof error === 'string' ? error : error?.message;

    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="mt-2 text-red-800">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-3 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    Intentar de nuevo
                </button>
            )}
        </div>
    );
}

export function EmptyState({ message = 'No hay datos disponibles' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12">
            <svg
                className="mb-4 size-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
            <p className="text-gray-600">{message}</p>
        </div>
    );
}
