'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoginRequest } from '@/types/api';
import { Button, Input, Label } from '@/components/ui';
import { AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState<LoginRequest>({
        username: '',
        password: '',
    });

    const [localError, setLocalError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setLocalError(null);
        clearError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!formData.username || !formData.password) {
            setLocalError('Por favor completa todos los campos');
            return;
        }

        try {
            await login(formData);
            // Redirect to applications or home
            const redirectTo = typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('from') || ROUTES.APPLICATIONS
                : ROUTES.APPLICATIONS;
            router.push(redirectTo);
        } catch (err) {
            setLocalError(error || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Credit Source
                        </h1>
                        <p className="text-gray-600">Sistema de Solicitudes de Crédito</p>
                    </div>

                    {/* Error Alert */}
                    {(localError || error) && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">
                                {localError || error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Usuario
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="tu_usuario"
                                className="mt-1"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="mt-1"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Inicializando...
                                </>
                            ) : (
                                'Inicia Sesión'
                            )}
                        </Button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿No tienes cuenta?{' '}
                            <Link
                                href={ROUTES.AUTH_REGISTER}
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    Demo credentials: user/user o admin/admin
                </p>
            </div>
        </div>
    );
}
