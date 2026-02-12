/**
 * Zod validation schemas for the application
 */

import { z } from 'zod';
import { ApplicationStatus, Country } from '@/types';
import { FIELD_LENGTHS } from './constants';

/**
 * Schema for creating a credit application
 */
export const createApplicationSchema = z
    .object({
        country: z
            .enum([Country.MX, Country.CO, Country.ES], {
                errorMap: () => ({ message: 'País es requerido' }),
            }),
        fullName: z
            .string()
            .min(FIELD_LENGTHS.MIN_FULL_NAME, `Mínimo ${FIELD_LENGTHS.MIN_FULL_NAME} caracteres`)
            .max(FIELD_LENGTHS.MAX_FULL_NAME, `Máximo ${FIELD_LENGTHS.MAX_FULL_NAME} caracteres`)
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
        documentType: z.string().min(1, 'Tipo de documento es requerido'),
        documentNumber: z
            .string()
            .min(1, 'Número de documento es requerido')
            .regex(/^[a-zA-Z0-9]+$/, 'Número de documento inválido'),
        amountRequested: z
            .number()
            .or(z.string().transform(Number))
            .refine((val) => !isNaN(val), 'Monto debe ser un número válido')
            .refine((val) => val >= FIELD_LENGTHS.MIN_AMOUNT, `Mínimo $${FIELD_LENGTHS.MIN_AMOUNT}`),
            // .refine((val) => val <= FIELD_LENGTHS.MAX_AMOUNT, `Máximo $${FIELD_LENGTHS.MAX_AMOUNT}`),
        monthlyIncome: z
            .number()
            .or(z.string().transform(Number))
            .refine((val) => !isNaN(val), 'Ingreso debe ser un número válido')
            .refine((val) => val > 0, 'El ingreso debe ser mayor a 0')
            // .refine((val) => val <= FIELD_LENGTHS.MAX_INCOME, 'Ingreso muy alto'),
    })
    // .refine(
    //     (data) => {
    //         const liRatio = data.amountRequested / data.monthlyIncome;
    //         return liRatio <= 10; // Maximum 10x ratio
    //     },
    //     {
    //         message: 'El monto solicitado es muy alto comparado con tu ingreso (máximo 10x)',
    //         path: ['amountRequested'],
    //     }
    // );

export type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

/**
 * Schema for updating application status
 */
export const updateApplicationStatusSchema = z
    .object({
        status: z.enum(
            [
                ApplicationStatus.PENDING_VALIDATION,
                ApplicationStatus.VALIDATING,
                ApplicationStatus.APPROVED,
                ApplicationStatus.REJECTED,
                ApplicationStatus.REVIEW_REQUIRED,
            ],
            { errorMap: () => ({ message: 'Estado inválido' }) }
        ),
        rejectionReason: z.string().optional(),
    })
    .refine(
        (data) => {
            // If status is REJECTED or REVIEW_REQUIRED, rejectionReason is required
            if (
                data.status === ApplicationStatus.REJECTED ||
                data.status === ApplicationStatus.REVIEW_REQUIRED
            ) {
                return (
                    data.rejectionReason &&
                    data.rejectionReason.length >= FIELD_LENGTHS.MIN_REASON &&
                    data.rejectionReason.length <= FIELD_LENGTHS.MAX_REASON
                );
            }
            return true;
        },
        {
            message: `La razón debe tener entre ${FIELD_LENGTHS.MIN_REASON} y ${FIELD_LENGTHS.MAX_REASON} caracteres`,
            path: ['rejectionReason'],
        }
    );

export type UpdateApplicationStatusFormData = z.infer<typeof updateApplicationStatusSchema>;

/**
 * Schema for rejection reason only (used in modal)
 */
export const rejectionReasonSchema = z.object({
    rejectionReason: z
        .string()
        .min(FIELD_LENGTHS.MIN_REASON, `Mínimo ${FIELD_LENGTHS.MIN_REASON} caracteres`)
        .max(FIELD_LENGTHS.MAX_REASON, `Máximo ${FIELD_LENGTHS.MAX_REASON} caracteres`),
});

export type RejectionReasonFormData = z.infer<typeof rejectionReasonSchema>;
