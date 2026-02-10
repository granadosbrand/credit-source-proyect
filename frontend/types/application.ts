/**
 * Credit Application types and enums
 */

export enum Country {
    MX = 'MX', // Mexico
    CO = 'CO', // Colombia
    ES = 'ES', // Spain
}

export enum ApplicationStatus {
    DRAFT = 'DRAFT',
    PENDING_VALIDATION = 'PENDING_VALIDATION',
    VALIDATING = 'VALIDATING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export interface CreditApplication {
    id: string;
    country: Country;
    fullName: string;
    documentType: string;
    documentNumber: string;
    amountRequested: number;
    monthlyIncome: number;
    status: ApplicationStatus;
    bankProviderData?: Record<string, any>;
    countryValidation?: Record<string, any>;
    riskScore?: number;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
}

export interface CreateCreditApplicationDto {
    country: Country;
    fullName: string;
    documentType: string;
    documentNumber: string;
    amountRequested: number;
    monthlyIncome: number;
}

export interface UpdateApplicationStatusDto {
    status: ApplicationStatus;
    rejectionReason?: string;
}

export interface CreditApplicationResponseDto extends CreditApplication { }

export type ApplicationFilters = {
    country?: Country;
    status?: ApplicationStatus;
    limit?: number;
    offset?: number;
};
