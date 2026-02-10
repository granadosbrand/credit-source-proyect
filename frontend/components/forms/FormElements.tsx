'use client';

import React from 'react';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input, Label, Button } from '@/components/ui';

/**
 * FormField Component - Wrapper para campos de formulario consistentes
 */
export interface FormFieldComponentProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    error?: string;
}

export function FormFieldComponent({
    label,
    description,
    error,
    ...props
}: FormFieldComponentProps) {
    return (
        <div className="space-y-2">
            {label && <Label htmlFor={props.id}>{label}</Label>}
            <Input {...props} />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

/**
 * FormContainer - Contenedor para formularios
 */
export function FormContainer({
    children,
    onSubmit,
    className = '',
}: {
    children: React.ReactNode;
    onSubmit?: () => void;
    className?: string;
}) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.();
            }}
            className={`space-y-6 ${className}`}
        >
            {children}
        </form>
    );
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };
