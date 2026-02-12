import {
    ICountryRule,
    CreateApplicationData,
} from '../interfaces/country-rule.interface';
import { ValidationResult } from '../interfaces/validation-result.interface';

/**
 * Reglas de validación para México
 *
 * Documentos: CURP (Clave Única de Registro de Población)
 * - Formato: 18 caracteres alfanuméricos
 * - Estructura: AAAAMMDDHXXYYYZZN
 *   - AAAA: Apellidos y nombre (4 letras)
 *   - MMDDAA: Fecha de nacimiento
 *   - H: Sexo (H/M)
 *   - XX: Estado de nacimiento (2 letras)
 *   - YYY: Primera consonante interna de apellidos y nombre
 *   - ZZ: Homoclave
 *   - N: Dígito verificador
 */
export class MxCountryRule implements ICountryRule {
    private readonly MAX_AMOUNT = 100000; // $100,000 MXN
    private readonly MAX_INCOME_RATIO = 10; // El crédito no puede exceder 10x el ingreso mensual
    private readonly MIN_AGE = 18;
    private readonly CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;

    validateDocument(
        documentType: string,
        documentNumber: string,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const metadata: Record<string, any> = {};

        // Validar tipo de documento
        if (documentType !== 'CURP') {
            errors.push(
                `Tipo de documento inválido para México. Se esperaba "CURP", se recibió "${documentType}"`,
            );
            return { isValid: false, errors, warnings, metadata };
        }

        // Validar formato
        if (!documentNumber || !this.CURP_REGEX.test(documentNumber.trim())) {
            errors.push(
                'CURP inválido. Debe tener 18 caracteres en el formato correcto (ej: PELJ000101HDFRRS09)',
            );
            return { isValid: false, errors, warnings, metadata };
        }

        // Extraer y validar edad desde la CURP
        try {
            const age = this.extractAgeFromCURP(documentNumber);
            metadata.curpAge = age;
            metadata.extractedBirthdate = this.extractBirthdateFromCURP(documentNumber);

            if (age < this.MIN_AGE) {
                errors.push(
                    `El solicitante debe ser mayor de edad. Edad extraída de CURP: ${age} años`,
                );
            }

            if (age >= 65) {
                warnings.push(
                    `El solicitante tiene ${age} años. Se recomienda revisión adicional para mayores de 65 años`,
                );
            }
        } catch (error) {
            errors.push('No se pudo extraer la edad del CURP proporcionado');
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
                `El monto solicitado ($${application.amountRequested.toLocaleString()}) excede el máximo permitido para México ($${this.MAX_AMOUNT.toLocaleString()} MXN)`,
            );
        }

        // Validar ratio ingreso/deuda
        const incomeRatio = application.amountRequested / application.monthlyIncome;
        metadata.incomeRatio = parseFloat(incomeRatio.toFixed(2));
        metadata.maxAllowedRatio = this.MAX_INCOME_RATIO;

        if (incomeRatio > this.MAX_INCOME_RATIO) {
            errors.push(
                `El ratio deuda/ingreso (${metadata.incomeRatio}x) excede el máximo permitido (${this.MAX_INCOME_RATIO}x). ` +
                `Con un ingreso mensual de $${application.monthlyIncome.toLocaleString()}, ` +
                `el monto máximo aprobable es $${(application.monthlyIncome * this.MAX_INCOME_RATIO).toLocaleString()}`,
            );
        } else if (incomeRatio > this.MAX_INCOME_RATIO * 0.9) {
            warnings.push(
                `El ratio deuda/ingreso (${metadata.incomeRatio}x) está muy cerca del límite (${this.MAX_INCOME_RATIO}x). Se recomienda revisión manual`,
            );
        }

        // Validar ingreso mínimo razonable
        if (application.monthlyIncome < 3000) {
            warnings.push(
                `Ingreso mensual muy bajo ($${application.monthlyIncome}). Se recomienda verificación de capacidad de pago`,
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
     * Extrae la fecha de nacimiento del CURP
     * Formato CURP: AAAAMMDDHXX...
     * Posiciones 4-9: YYMMDD
     */
    private extractAgeFromCURP(curp: string): number {
        const year = parseInt(curp.substring(4, 6));
        const month = parseInt(curp.substring(6, 8));
        const day = parseInt(curp.substring(8, 10));

        // Determinar el siglo (asumiendo que CURP usa YY: 00-99)
        const fullYear = year >= 0 && year <= 25 ? 2000 + year : 1900 + year;

        const birthDate = new Date(fullYear, month - 1, day);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    }

    private extractBirthdateFromCURP(curp: string): string {
        const year = parseInt(curp.substring(4, 6));
        const month = curp.substring(6, 8);
        const day = curp.substring(8, 10);
        const fullYear = year >= 0 && year <= 25 ? 2000 + year : 1900 + year;

        return `${fullYear}-${month}-${day}`;
    }
}
