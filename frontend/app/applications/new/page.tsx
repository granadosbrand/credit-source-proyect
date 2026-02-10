'use client';

import React from 'react';
import { CreateApplicationForm } from '@/components/applications/CreateApplicationForm';

export default function NewApplicationPage() {
    return (
        <div className="space-y-6">
            <CreateApplicationForm />
        </div>
    );
}
