import {
    ICountryRule,
    CreateApplicationData,
} from '../interfaces/country-rule.interface';
import { ValidationResult } from '../interfaces/validation-result.interface';

/**
 * Reglas de validación para España
 *
 * Documentos: DNI (Documento Nacional de Identidad) o NIE (Número de Identificación de Extranjero)
 * - DNI: 8 dígitos + 1 letra de control
 * - NIE: X/Y/Z + 7 dígitos + 1 letra de control
 * - La letra se calcula mediante módulo 23
 */
export class EsCountryRule implements ICountryRule {
    private readonly MAX_AMOUNT = 50000; // €50,000 EUR
    private readonly MAX_INCOME_RATIO = 5; // El crédito no puede exceder 5x el ingreso mensual (más conservador)
    private readonly MIN_AGE = 18;
    private readonly DNI_NIE_REGEX = /^[XYZ]?\d{7,8}[A-Z]$/;
    private readonly DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

    validateDocument(
        documentType: string,
        documentNumber: string,
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const metadata: Record<string, any> = {};

        // Validar tipo de documento
        if (documentType !== 'DNI' && documentType !== 'NIE') {
            errors.push(
                `Tipo de documento inválido para España. Se esperaba "DNI" o "NIE", se recibió "${documentType}"`,
            );
            return { isValid: false, errors, warnings, metadata };
        }

        // Limpiar y normalizar
        const cleanedDoc = documentNumber.replace(/[\s.-]/g, '').toUpperCase();

        // Validar formato básico
        if (!this.DNI_NIE_REGEX.test(cleanedDoc)) {
            errors.push(
                'DNI/NIE inválido. Formato esperado: 12345678X (DNI) o X1234567X (NIE)',
            );
            return { isValid: false, errors, warnings, metadata };
        }

        metadata.documentType = cleanedDoc.startsWith('X') ||
            cleanedDoc.startsWith('Y') ||
            cleanedDoc.startsWith('Z')
            ? 'NIE'
            : 'DNI';

        // Validar letra de control
        const isValid = this.validateDniNieLetter(cleanedDoc);
        if (!isValid) {
            errors.push(
                'La letra de control del DNI/NIE no es válida. Verifique el número ingresado',
            );
        }

        metadata.documentNumber = cleanedDoc;

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
                `El monto solicitado (€${application.amountRequested.toLocaleString()}) excede el máximo permitido para España (€${this.MAX_AMOUNT.toLocaleString()})`,
            );
        }

        // Validar ratio ingreso/deuda (más estricto en España)
        const incomeRatio = application.amountRequested / application.monthlyIncome;
        metadata.incomeRatio = parseFloat(incomeRatio.toFixed(2));
        metadata.maxAllowedRatio = this.MAX_INCOME_RATIO;
        metadata.maxAmountBasedOnIncome =
            application.monthlyIncome * this.MAX_INCOME_RATIO;

        if (incomeRatio > this.MAX_INCOME_RATIO) {
            errors.push(
                `El ratio deuda/ingreso (${metadata.incomeRatio}x) excede el máximo permitido (${this.MAX_INCOME_RATIO}x). ` +
                `Con un ingreso mensual de €${application.monthlyIncome.toLocaleString()}, ` +
                `el monto máximo aprobable es €${metadata.maxAmountBasedOnIncome.toLocaleString()}`,
            );
        } else if (incomeRatio > this.MAX_INCOME_RATIO * 0.8) {
            warnings.push(
                `El ratio deuda/ingreso (${metadata.incomeRatio}x) está cerca del límite (${this.MAX_INCOME_RATIO}x). Se recomienda revisión manual`,
            );
        }

        // Validar ingreso mínimo (SMI España aprox €1,200/mes en 2026)
        const SMI_SPAIN = 1200;
        if (application.monthlyIncome < SMI_SPAIN) {
            warnings.push(
                `Ingreso mensual (€${application.monthlyIncome}) está por debajo del SMI. ` +
                `Se requiere justificación adicional`,
            );
        }

        // Warning si el crédito es muy alto
        if (application.amountRequested > this.MAX_AMOUNT * 0.75) {
            warnings.push(
                'El monto solicitado es elevado. Se recomienda verificación exhaustiva de solvencia',
            );
        }

        // Si el ingreso es muy alto pero el crédito proporcionalmente bajo, es buena señal
        if (incomeRatio < 2 && application.amountRequested < 10000) {
            metadata.riskLevel = 'low';
        } else if (incomeRatio > 4) {
            metadata.riskLevel = 'high';
        } else {
            metadata.riskLevel = 'medium';
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
     * Valida la letra de control de un DNI o NIE español
     * Algoritmo:
     * 1. Para NIE, reemplazar X=0, Y=1, Z=2
     * 2. Tomar los dígitos numéricos
     * 3. Calcular módulo 23
     * 4. La letra debe coincidir con la posición en el alfabeto de control
     */
    private validateDniNieLetter(doc: string): boolean {
        let numericPart = doc.slice(0, -1);
        const letter = doc.slice(-1);

        // Convertir NIE a número
        if (numericPart.startsWith('X')) numericPart = '0' + numericPart.slice(1);
        if (numericPart.startsWith('Y')) numericPart = '1' + numericPart.slice(1);
        if (numericPart.startsWith('Z')) numericPart = '2' + numericPart.slice(1);

        const number = parseInt(numericPart, 10);
        if (isNaN(number)) return false;

        const expectedLetter = this.DNI_LETTERS[number % 23];
        return letter === expectedLetter;
    }
}
