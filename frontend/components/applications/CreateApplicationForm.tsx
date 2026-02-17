'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { COUNTRIES, FIELD_LENGTHS, ROUTES } from '@/lib/constants';
import { createApplicationSchema, CreateApplicationFormData } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CreateApplicationFormProps {
    onSuccess?: () => void;
}

/**
 * CreateApplicationForm - Formulario para crear una nueva solicitud de crédito
 */
export function CreateApplicationForm({ onSuccess }: CreateApplicationFormProps) {
    const router = useRouter();
    const { createApplicationAsync, isCreating } = useMutations();
    const [selectedCountry, setSelectedCountry] = React.useState<string>('');
    const [submitError, setSubmitError] = React.useState<string>('');

    const currentCurrency = useMemo(() => {
        const country = COUNTRIES[selectedCountry as keyof typeof COUNTRIES];
        return country ? country.currency : 'USD';
    }, [selectedCountry]);

    const form = useForm<CreateApplicationFormData>({
        resolver: zodResolver(createApplicationSchema),
        defaultValues: {
            country: undefined,
            fullName: '',
            documentType: '',
            documentNumber: '',
            amountRequested: 0,
            monthlyIncome: 0,
        },
        mode: 'onChange',
    });

    const amountRequested = form.watch('amountRequested');
    const monthlyIncome = form.watch('monthlyIncome');

    // Calculate L/I ratio
    const liRatio = useMemo(() => {
        if (monthlyIncome && monthlyIncome > 0) {
            return (amountRequested / monthlyIncome).toFixed(2);
        }
        return '0.00';
    }, [amountRequested, monthlyIncome]);

    // Determine if ratio is critical
    const isRatioCritical = monthlyIncome > 0 && parseFloat(liRatio) > 5;
    const isRatioInvalid = monthlyIncome > 0 && parseFloat(liRatio) > 10;

    const documentTypes =
        selectedCountry && selectedCountry in COUNTRIES
            ? COUNTRIES[selectedCountry as keyof typeof COUNTRIES].documentTypes
            : [];

    const onSubmit = async (data: CreateApplicationFormData) => {
        try {
            setSubmitError('');
            await createApplicationAsync(data as CreateCreditApplicationDto);
            onSuccess?.();
            router.push(ROUTES.APPLICATIONS);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear la solicitud';
            setSubmitError(errorMessage);
        }
    };

    return (
        <div className="space-y-4">
            <Link href={ROUTES.APPLICATIONS}>
                <Button variant="outline" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver</span>
                </Button>
            </Link>

            <Card className="w-full mt-4">
                <CardHeader>
                    <CardTitle className="text-2xl">Nueva Solicitud de Crédito</CardTitle>
                    <CardDescription>
                        Complete el formulario con sus datos personales y financieros para solicitar crédito
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-900">Error al crear solicitud</p>
                                        <p className="text-sm text-red-700 mt-1">{submitError}</p>
                                    </div>
                                </div>
                            )}

                            {/* País */}
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País *</FormLabel>
                                        <FormControl>
                                            <CountrySelector
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                    setSelectedCountry(value || '');
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
                                        <FormLabel>Nombre Completo *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Juan Pérez Rodríguez"
                                                {...field}
                                                disabled={isCreating}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Tu nombre completo tal como aparece en tu documento de identidad
                                        </FormDescription>
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
                                        <FormLabel>Tipo de Documento *</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={!selectedCountry || isCreating}
                                            >
                                                <option value="">
                                                    {selectedCountry ? 'Selecciona tipo de documento' : 'Selecciona un país primero'}
                                                </option>
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
                                        <FormLabel>Número de Documento *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1234567890"
                                                {...field}
                                                disabled={isCreating}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Tu número de {form.getValues('documentType') || 'documento'} sin espacios ni caracteres especiales
                                        </FormDescription>
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
                                        <FormLabel>Monto Solicitado {currentCurrency} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="5000"
                                                {...field}
                                                disabled={isCreating}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        {/* <FormDescription>
                                            Entre {formatCurrency(FIELD_LENGTHS.MIN_AMOUNT)} y {formatCurrency(FIELD_LENGTHS.MAX_AMOUNT)}
                                        </FormDescription> */}
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
                                        <FormLabel>Ingreso Mensual {currentCurrency} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2000"
                                                {...field}
                                                disabled={isCreating}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Tu ingreso bruto mensual aproximado
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* L/I Ratio Display */}
                            {/*monthlyIncome > 0 && (
                                <div className={`p-4 rounded-md border-2 ${isRatioInvalid
                                        ? 'border-red-200 bg-red-50'
                                        : isRatioCritical
                                            ? 'border-yellow-200 bg-yellow-50'
                                            : 'border-green-200 bg-green-50'
                                    }`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className={`font-medium ${isRatioInvalid
                                                    ? 'text-red-900'
                                                    : isRatioCritical
                                                        ? 'text-yellow-900'
                                                        : 'text-green-900'
                                                }`}>
                                                Ratio Préstamo/Ingreso (L/I)
                                            </p>
                                            <p className={`text-sm ${isRatioInvalid
                                                    ? 'text-red-700'
                                                    : isRatioCritical
                                                        ? 'text-yellow-700'
                                                        : 'text-green-700'
                                                }`}>
                                                {isRatioInvalid && '⚠️ Excede el límite de 10x'}
                                                {isRatioCritical && !isRatioInvalid && '⚠️ Alto - considera reducir monto o aumentar ingreso'}
                                                {!isRatioCritical && !isRatioInvalid && '✓ Ratio saludable'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${isRatioInvalid
                                                    ? 'text-red-600'
                                                    : isRatioCritical
                                                        ? 'text-yellow-600'
                                                        : 'text-green-600'
                                                }`}>
                                                {liRatio}x
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )*/}

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1"
                                >
                                    {isCreating ? 'Creando solicitud...' : 'Crear Solicitud'}
                                </Button>
                                <Link href={ROUTES.APPLICATIONS} className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        disabled={isCreating}
                                    >
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
