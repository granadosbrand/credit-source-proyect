import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/auth/login', '/auth/register', '/'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    console.log("pato")

    // Saltar middleware para rutas estáticas
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/public') ||
        pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico)$/)
    ) {
        return NextResponse.next();
    }

    // Si es ruta pública, permitir acceso (pero redirigir a applications si está autenticado)
    if (publicRoutes.includes(pathname)) {
        // Obtener token del request
        const bearerToken = request.headers.get('authorization')?.split(' ')[1];

        // Si está autenticado y accede a auth, redirigir a applications
        if (bearerToken && (pathname === '/auth/login' || pathname === '/auth/register')) {
            console.log("entró aqui juemadre")
            return NextResponse.redirect(new URL('/applications', request.url));
        }
        return NextResponse.next();
    }

    // Para otras rutas protegidas, el cliente manejará el redirect
    // porque el token está en localStorage del navegador
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
