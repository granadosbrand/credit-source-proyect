'use client';

import React from 'react';

/**
 * Footer - Pie de página
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-white mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold mb-4">Credit Source</h3>
                        <p className="text-sm text-muted-foreground">
                            Sistema de solicitudes de crédito multi-país con procesamiento asíncrono y validaciones en tiempo real.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Enlaces</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition">Inicio</a></li>
                            <li><a href="#" className="hover:text-foreground transition">Aplicaciones</a></li>
                            <li><a href="#" className="hover:text-foreground transition">Documentación</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <p className="text-sm text-muted-foreground">
                            Para soporte o consultas, contacta al equipo técnico.
                        </p>
                    </div>
                </div>
                <div className="border-t pt-8">
                    <p className="text-sm text-muted-foreground text-center">
                        © {currentYear} Credit Source. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
