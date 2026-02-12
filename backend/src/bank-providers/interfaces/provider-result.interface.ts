import { Country } from '../../credit-applications/credit-application.entity';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ProviderResult {
    provider: string;
    country: Country;
    score: number;
    normalizedScore: number;
    riskLevel: RiskLevel;
    totalDebt: number;
    monthlyDebt: number;
    incomeVerified: boolean;
    raw: Record<string, any>;
}
