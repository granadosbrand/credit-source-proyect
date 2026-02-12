import {
    ICountryRule,
    CreateApplicationData,
} from '../interfaces/country-rule.interface';
import { ValidationResult } from '../interfaces/validation-result.interface';

/**
 * Reglas de validación para Colombia
 *
 * Documentos: CC (Cédula de Ciudadanía)
 * - Formato: 6 a 10 dígitos numéricos
 * - Sin guiones ni puntos
 * - Los números más comunes están entre 1.000.000 y 99.999.999
 */
export class CoCountryRule implements ICountryRule {
    private readonly MAX_AMOUNT = 50000000; // $50,000,000 COP (aprox $12,500 USD)
    private readonly MAX_INCOME_RATIO = 8; // El crédito no puede exceder 8x el ingreso mensual
    private readonly MIN_AGE = 18;
    private readonly CC_REGEX = /^\d{6,10}$/;

    validateDocument(
        documentType: string,
        documentNumber: string,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const metadata: Record<string, any> = {};

        // Validar tipo de documento
        if (documentType !== 'CC') {
            errors.push(
                `Tipo de documento inválido para Colombia. Se esperaba "CC" (Cédula de Ciudadanía), se recibió "${documentType}"`,
            );
            return { isValid: false, errors, warnings, metadata };
        }

        // Validar formato
        const cleanedNumber = documentNumber.replace(/[\s.-]/g, '');

        if (!this.CC_REGEX.test(cleanedNumber)) {
            errors.push(
                'Cédula de Ciudadanía inválida. Debe contener entre 6 y 10 dígitos numéricos (ej: 1234567890)',
            );
            return { isValid: false, errors, warnings, metadata };
        }

        metadata.ccNumber = cleanedNumber;
        metadata.ccLength = cleanedNumber.length;

        // Advertencias para números sospechosos
        if (cleanedNumber.length < 7) {
            warnings.push(
                'Número de cédula poco común (menos de 7 dígitos). Se recomienda verificación adicional',
            );
        }

        // Validar patrones sospechosos (números secuenciales, repetidos, etc.)
        if (this.isSuspiciousPattern(cleanedNumber)) {
            warnings.push(
                'El número de cédula tiene un patrón inusual. Se recomienda verificación',
            );
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            metadata,
        };
    }

    validateBusinessRules(application: CreateApplicationData): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const metadata: Record<string, any> = {};

        // Validar monto máximo
        if (application.amountRequested > this.MAX_AMOUNT) {
            errors.push(
                `El monto solicitado ($${application.amountRequested.toLocaleString()} COP) excede el máximo permitido para Colombia ($${this.MAX_AMOUNT.toLocaleString()} COP)`,
            );
        }

        // Validar ratio ingreso/deuda
        const incomeRatio = application.amountRequested / application.monthlyIncome;
        metadata.incomeRatio = parseFloat(incomeRatio.toFixed(2));
        metadata.maxAllowedRatio = this.MAX_INCOME_RATIO;
        metadata.maxAmountBasedOnIncome =
            application.monthlyIncome * this.MAX_INCOME_RATIO;

        if (incomeRatio > this.MAX_INCOME_RATIO) {
            errors.push(
                `El ratio deuda/ingreso (${metadata.incomeRatio}x) excede el máximo permitido (${this.MAX_INCOME_RATIO}x). ` +
                `Con un ingreso mensual de $${application.monthlyIncome.toLocaleString()} COP, ` +
                `el monto máximo aprobable es $${metadata.maxAmountBasedOnIncome.toLocaleString()} COP`,
            );
        } else if (incomeRatio > this.MAX_INCOME_RATIO * 0.85) {
            warnings.push(
                `El ratio deuda/ingreso (${metadata.incomeRatio}x) está cerca del límite (${this.MAX_INCOME_RATIO}x). Se recomienda revisión manual`,
            );
        }

        // Validar ingreso mínimo (salario mínimo en Colombia aprox $1,300,000 COP en 2026)
        const SALARIO_MINIMO_CO = 1300000;
        if (application.monthlyIncome < SALARIO_MINIMO_CO) {
            warnings.push(
                `Ingreso mensual ($${application.monthlyIncome.toLocaleString()} COP) está por debajo del salario mínimo. ` +
                `Se recomienda verificación de capacidad de pago`,
            );
        }

        // Si el monto es muy alto, agregar warning
        if (application.amountRequested > this.MAX_AMOUNT * 0.8) {
            warnings.push(
                'El monto solicitado es muy cercano al límite máximo. Se recomienda evaluación crediticia exhaustiva',
            );
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            metadata,
        };
    }

    getMaxAmount(): number {
        return this.MAX_AMOUNT;
    }

    getMaxIncomeRatio(): number {
        return this.MAX_INCOME_RATIO;
    }

    /**
     * Detecta patrones sospechosos en el número de cédula:
     * - Todos los dígitos iguales (111111, 222222)
     * - Secuencias ascendentes/descendentes (123456, 654321)
     */
    private isSuspiciousPattern(cc: string): boolean {
        // Todos los dígitos iguales
        const allSame = cc.split('').every((digit) => digit === cc[0]);
        if (allSame) return true;

        // Secuencia ascendente o descendente
        const digits = cc.split('').map(Number);
        let isAscending = true;
        let isDescending = true;

        for (let i = 1; i < digits.length; i++) {
            if (digits[i] !== digits[i - 1] + 1) isAscending = false;
            if (digits[i] !== digits[i - 1] - 1) isDescending = false;
        }

        return isAscending || isDescending;
    }
}
