'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarLink {
    href: string;
    label: string;
    icon?: React.ReactNode;
}

const links: SidebarLink[] = [
    {
        href: '/',
        label: 'Dashboard',
    },
    {
        href: '/applications',
        label: 'Mis Solicitudes',
    },
    {
        href: '/applications/new',
        label: 'Nueva Solicitud',
    },
];

/**
 * Sidebar - Panel lateral de navegación
 */
export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Sidebar Toggle - puede implementarse con un botón hamburguesa */}
            <aside className="hidden md:flex flex-col w-64 border-r bg-muted/50 min-h-screen">
                <div className="p-6">
                    <h2 className="font-bold text-lg">Menú</h2>
                </div>
                <nav className="flex-1 space-y-2 px-4">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                                pathname === link.href
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-accent'
                            )}
                        >
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t text-xs text-muted-foreground">
                    <p>Credit Source © 2026</p>
                </div>
            </aside>
        </>
    );
}
