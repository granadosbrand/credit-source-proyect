'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Button,
    Input,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui';
import { CountrySelector } from '@/components/applications';
import { useMutations } from '@/hooks/useMutations';
import { CreateCreditApplicationDto } from '@/types/api';
import { COUNTRIES, FIELD_LENGTHS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';

// Validación con Zod
const createApplicationSchema = z.object({
    country: z.string().min(1, 'País es requerido'),
    fullName: z
        .string()
        .min(FIELD_LENGTHS.MIN_FULL_NAME, `Mínimo ${FIELD_LENGTHS.MIN_FULL_NAME} caracteres`)
        .max(FIELD_LENGTHS.MAX_FULL_NAME, `Máximo ${FIELD_LENGTHS.MAX_FULL_NAME} caracteres`),
    documentType: z.string().min(1, 'Tipo de documento es requerido'),
    documentNumber: z.string().min(1, 'Número de documento es requerido'),
    amountRequested: z
        .coerce
        .number()
        .min(FIELD_LENGTHS.MIN_AMOUNT, `Mínimo $${FIELD_LENGTHS.MIN_AMOUNT}`)
        .max(FIELD_LENGTHS.MAX_AMOUNT, `Máximo $${FIELD_LENGTHS.MAX_AMOUNT}`),
    monthlyIncome: z
        .coerce
        .number()
        .min(FIELD_LENGTHS.MIN_INCOME, 'Ingreso mínimo es 0')
        .max(FIELD_LENGTHS.MAX_INCOME, 'Ingreso muy alto'),
});

type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

interface CreateApplicationFormProps {
    onSuccess?: () => void;
}

/**
 * CreateApplicationForm - Formulario para crear una nueva solicitud de crédito
 */
export function CreateApplicationForm({ onSuccess }: CreateApplicationFormProps) {
    const router = useRouter();
    const { createApplication, isCreating } = useMutations();
    const [selectedCountry, setSelectedCountry] = React.useState<string>('');

    const form = useForm<CreateApplicationFormData>({
        resolver: zodResolver(createApplicationSchema),
        defaultValues: {
            country: '',
            fullName: '',
            documentType: '',
            documentNumber: '',
            amountRequested: 0,
            monthlyIncome: 0,
        },
    });

    const documentTypes =
        selectedCountry && selectedCountry in COUNTRIES
            ? COUNTRIES[selectedCountry as keyof typeof COUNTRIES].documentTypes
            : [];

    const onSubmit = async (data: CreateApplicationFormData) => {
        try {
            await createApplication(data as CreateCreditApplicationDto);
            onSuccess?.();
            router.push(ROUTES.APPLICATIONS);
        } catch (error) {
            console.error('Error creating application:', error);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Nueva Solicitud de Crédito</CardTitle>
                <CardDescription>
                    Complete el formulario con sus datos personales y financieros
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* País */}
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>País</FormLabel>
                                    <FormControl>
                                        <CountrySelector
                                            value={field.value}
                                            onChange={(value) => {
                                                field.onChange(value);
                                                setSelectedCountry(value);
                                                form.setValue('documentType', '');
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Nombre Completo */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormDescription>Tu nombre completo tal como aparece en tu documento</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tipo de Documento */}
                        <FormField
                            control={form.control}
                            name="documentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Documento</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={!selectedCountry}
                                        >
                                            <option value="">Selecciona tipo de documento</option>
                                            {documentTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Número de Documento */}
                        <FormField
                            control={form.control}
                            name="documentNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Documento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Monto Solicitado */}
                        <FormField
                            control={form.control}
                            name="amountRequested"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Solicitado (USD)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="5000" {...field} />
                                    </FormControl>
                                    <FormDescription>Entre ${FIELD_LENGTHS.MIN_AMOUNT} y ${FIELD_LENGTHS.MAX_AMOUNT}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ingreso Mensual */}
                        <FormField
                            control={form.control}
                            name="monthlyIncome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ingreso Mensual (USD)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="2000" {...field} />
                                    </FormControl>
                                    <FormDescription>Tu ingreso mensual aproximado</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Botones */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isCreating} className="flex-1">
                                {isCreating ? 'Creando...' : 'Crear Solicitud'}
                            </Button>
                            <Link href={ROUTES.APPLICATIONS} className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancelar
                                </Button>
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
