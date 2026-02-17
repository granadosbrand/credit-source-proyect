'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/shared';

export default function Home() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            router.push(ROUTES.APPLICATIONS);
        } else {
            router.push(ROUTES.AUTH_LOGIN);
        }
    }, [user, router]);

    return <LoadingSpinner />;
}
