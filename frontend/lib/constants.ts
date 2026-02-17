/**
 * Application-wide constants
 */

import { Country, ApplicationStatus } from '@/types';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const API_TIMEOUT = 30000; // 30 seconds

// Countries
export const COUNTRIES = {
    [Country.MX]: {
        label: 'México',
        code: Country.MX,
        documentTypes: ['CURP', 'RFC'],
        currency: 'MXN',
    },
    [Country.CO]: {
        label: 'Colombia',
        code: Country.CO,
        documentTypes: ['CC', 'CE'],
        currency: 'COP',
    },
    [Country.ES]: {
        label: 'España',
        code: Country.ES,
        documentTypes: ['NIF', 'NIE'],
        currency: 'EUR',
    },
};

export const COUNTRY_LIST = Object.values(COUNTRIES);

// Application Status
export const APPLICATION_STATUSES = {
    [ApplicationStatus.DRAFT]: {
        label: 'Borrador',
        color: 'bg-gray-100 text-gray-800',
        badge: 'secondary',
    },
    [ApplicationStatus.PENDING_VALIDATION]: {
        label: 'Pendiente de Validación',
        color: 'bg-blue-100 text-blue-800',
        badge: 'default',
    },
    [ApplicationStatus.VALIDATING]: {
        label: 'En Validación',
        color: 'bg-yellow-100 text-yellow-800',
        badge: 'warning',
    },
    [ApplicationStatus.APPROVED]: {
        label: 'Aprobado',
        color: 'bg-green-100 text-green-800',
        badge: 'success',
    },
    [ApplicationStatus.REJECTED]: {
        label: 'Rechazado',
        color: 'bg-red-100 text-red-800',
        badge: 'destructive',
    },
    [ApplicationStatus.REVIEW_REQUIRED]: {
        label: 'Revisión Requerida',
        color: 'bg-purple-100 text-purple-800',
        badge: 'outline',
    },
};

export const STATUS_LIST = Object.entries(APPLICATION_STATUSES).map(([key, value]) => ({
    value: key as ApplicationStatus,
    ...value,
}));

// Form validation lengths
export const FIELD_LENGTHS = {
    MIN_FULL_NAME: 3,
    MAX_FULL_NAME: 100,
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 1000000,
    MIN_INCOME: 0,
    MAX_INCOME: 999999999,
    MIN_REASON: 5,
    MAX_REASON: 500,
};

// Transaction states
export const TRANSACTION_STATES = [
    ApplicationStatus.DRAFT,
    ApplicationStatus.PENDING_VALIDATION,
    ApplicationStatus.VALIDATING,
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.REVIEW_REQUIRED,
];

// Rejection state values
export const REJECTION_STATUSES = [
    ApplicationStatus.REJECTED,
    ApplicationStatus.REVIEW_REQUIRED,
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZES = [10, 20, 50, 100];

// Routes
export const ROUTES = {
    HOME: '/',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    APPLICATIONS: '/applications',
    APPLICATION_NEW: '/applications/new',
    APPLICATION_DETAIL: (id: string) => `/applications/${id}`,
};

// Messages
export const MESSAGES = {
    SUCCESS: {
        CREATED: 'Solicitud creada exitosamente',
        UPDATED: 'Solicitud actualizada exitosamente',
        STATUS_CHANGED: 'Estado actualizado exitosamente',
        DELETED: 'Solicitud eliminada exitosamente',
    },
    ERROR: {
        FETCH_FAILED: 'Error al cargar los datos',
        CREATE_FAILED: 'Error al crear la solicitud',
        UPDATE_FAILED: 'Error al actualizar la solicitud',
        DELETE_FAILED: 'Error al eliminar la solicitud',
        INVALID_DATA: 'Los datos proporcionados son inválidos',
        NETWORK_ERROR: 'Error de conexión. Intenta de nuevo',
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Este campo es requerido',
        INVALID_EMAIL: 'Email inválido',
        INVALID_AMOUNT: 'El monto debe ser mayor a 0',
    },
};
