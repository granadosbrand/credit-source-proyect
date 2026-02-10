'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Plus, Home } from 'lucide-react';

/**
 * Navbar - Barra de navegación principal
 */
export function Navbar() {
    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">CS</span>
                        </div>
                        <span className="font-bold text-lg">Credit Source</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link href="/applications">
                            <Button variant="ghost" className="flex items-center space-x-2">
                                <Home className="h-4 w-4" />
                                <span>Aplicaciones</span>
                            </Button>
                        </Link>
                        <Link href="/applications/new">
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Nueva Solicitud</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
