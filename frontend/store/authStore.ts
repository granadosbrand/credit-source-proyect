import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';
import apiClient from '@/lib/api/client';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            setToken: (token: string | null) => {
                set({ token });
                if (token) {
                    localStorage.setItem('auth_token', token);
                } else {
                    localStorage.removeItem('auth_token');
                }
            },

            setUser: (user: User | null) => {
                set({ user });
            },

            clearError: () => {
                set({ error: null });
            },

            login: async (credentials: LoginRequest) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post<AuthResponse>(
                        '/api/auth/login',
                        credentials,
                    );

                    set({
                        token: response.data.access_token,
                        user: response.data.user,
                        isLoading: false,
                    });

                    localStorage.setItem('auth_token', response.data.access_token);
                } catch (error: any) {
                    const message =
                        error.message || 'Error al iniciar sesión';
                    set({
                        error: message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: RegisterRequest) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post<AuthResponse>(
                        '/api/auth/register',
                        data,
                    );

                    set({
                        token: response.data.access_token,
                        user: response.data.user,
                        isLoading: false,
                    });

                    localStorage.setItem('auth_token', response.data.access_token);
                } catch (error: any) {
                    const message =
                        error.message || 'Error al registrarse';
                    set({
                        error: message,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    error: null,
                });
                localStorage.removeItem('auth_token');
            },
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        },
    ),
);
