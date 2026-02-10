/**
 * Application configuration
 */

export const config = {
    api: {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        timeout: 30000,
    },
    app: {
        name: 'Credit Source',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
        isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === 'development',
        isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
    },
} as const;
