'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Plus, Home, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';

/**
 * Navbar - Barra de navegación principal
 */
export function Navbar() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push(ROUTES.AUTH_LOGIN);
    };

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
                        {user && user.role === 'USER' && (
                            <>
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
                            </>
                        )}

                        {user && user.role === 'ADMIN' && (
                            <Link href="/applications">
                                <Button variant="ghost" className="flex items-center space-x-2">
                                    <Home className="h-4 w-4" />
                                    <span>Panel Admin</span>
                                </Button>
                            </Link>
                        )}

                        {user && (
                            <div className="flex items-center gap-3 pl-4 border-l">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-600" />
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900 text-xs">{user.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleLogout}
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Salir</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
