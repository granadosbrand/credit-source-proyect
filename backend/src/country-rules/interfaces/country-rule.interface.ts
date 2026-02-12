import { ValidationResult } from './validation-result.interface';

export interface CreateApplicationData {
    country: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
    amountRequested: number;
    monthlyIncome: number;
}

export interface ICountryRule {
    /**
     * Valida el formato y contenido del documento de identidad
     */
    validateDocument(
        documentType: string,
        documentNumber: string,
    ): ValidationResult;

    /**
     * Valida las reglas de negocio específicas del país
     */
    validateBusinessRules(application: CreateApplicationData): ValidationResult;

    /**
     * Retorna el monto máximo permitido para créditos en este país
     */
    getMaxAmount(): number;

    /**
     * Retorna el ratio máximo permitido entre monto solicitado e ingreso mensual
     */
    getMaxIncomeRatio(): number;
}
