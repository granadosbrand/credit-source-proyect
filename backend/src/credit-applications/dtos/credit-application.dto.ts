import { v4 as uuid } from 'uuid';
import { CreditApplication, Country, ApplicationStatus } from '../credit-application.entity';
import { debugPort } from 'process';

export class CreateCreditApplicationDto {
    country: Country;
    fullName: string;
    documentType: string;
    documentNumber: string;
    amountRequested: number;
    monthlyIncome: number;
}

export class UpdateApplicationStatusDto {
    status: ApplicationStatus;
    rejectionReason?: string;
}

/**
 * DTO General - Incluye datos sensibles (admin/internal)
 * Mantiene compatibilidad con código existente
 */
export class CreditApplicationResponseDto {
    id: string;
    country: Country;
    fullName: string;
    documentType: string;
    amountRequested: number;
    monthlyIncome: number;
    status: ApplicationStatus;
    bankProviderData: Record<string, any>;
    countryValidation: Record<string, any>;
    riskScore: number;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(entity: CreditApplication): CreditApplicationResponseDto {
        const dto = new CreditApplicationResponseDto();
        dto.id = entity.id;
        dto.country = entity.country;
        dto.fullName = entity.fullName;
        dto.documentType = entity.documentType;
        dto.amountRequested = entity.amountRequested;
        dto.monthlyIncome = entity.monthlyIncome;
        dto.status = entity.status;
        dto.bankProviderData = entity.bankProviderData;
        dto.countryValidation = entity.countryValidation;
        dto.riskScore = entity.riskScore;
        dto.rejectionReason = entity.rejectionReason;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}

/**
 * DTO Público - Filtra datos sensibles (para usuarios normales)
 * Omite: bankProviderData, riskScore, countryValidation, documentNumber
 */
export class CreditApplicationPublicDto {
    id: string;
    country: Country;
    fullName: string;
    documentType: string;
    amountRequested: number;
    status: ApplicationStatus;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(entity: CreditApplication): CreditApplicationPublicDto {
        const dto = new CreditApplicationPublicDto();
        dto.id = entity.id;
        dto.country = entity.country;
        dto.fullName = entity.fullName;
        dto.documentType = entity.documentType;
        dto.amountRequested = entity.amountRequested;
        dto.status = entity.status;
        dto.rejectionReason = entity.rejectionReason;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        
        return dto;
    }
}
