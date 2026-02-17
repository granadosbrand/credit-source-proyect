'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserRole, RegisterRequest } from '@/types/api';
import { Button, Input, Label } from '@/components/ui';
import { AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState<RegisterRequest>({
        email: '',
        password: '',
        role: 'USER',
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        setLocalError(null);
        clearError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        // Validations
        if (!formData.email || !formData.password || !confirmPassword) {
            setLocalError('Por favor completa todos los campos');
            return;
        }

        if (formData.password.length < 8) {
            setLocalError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (formData.password !== confirmPassword) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }

        try {
            await register(formData);
            router.push(ROUTES.APPLICATIONS);
        } catch (err) {
            setLocalError(error || 'Error al registrarse');
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
                        <p className="text-gray-600">Crear Nueva Cuenta</p>
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
                        {/* Email */}
                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                className="mt-1"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña (mín. 8 caracteres)
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

                        {/* Confirm Password */}
                        <div>
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirmar Contraseña
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="mt-1"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Role Selector */}
                        <div>
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                Tipo de Usuario
                            </Label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                            >
                                <option value="USER">Usuario (Solicitar Crédito)</option>
                                <option value="ADMIN">Administrador (Ver Panel)</option>
                            </select>
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
                                    Registrando...
                                </>
                            ) : (
                                'Crear Cuenta'
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                href={ROUTES.AUTH_LOGIN}
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
