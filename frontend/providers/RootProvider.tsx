'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { WebSocketProvider } from './WebSocketProvider';

/**
 * Root Provider - Wraps the application with all necessary providers
 */
export function RootProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WebSocketProvider>
                {children}
                <Toaster position="top-right" richColors />
                <ReactQueryDevtools initialIsOpen={false} />
            </WebSocketProvider>
        </QueryClientProvider>
    );
}
