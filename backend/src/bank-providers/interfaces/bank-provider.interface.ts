import { Country } from '../../credit-applications/credit-application.entity';

export interface BankProviderRequest {
    country: Country;
    fullName: string;
    documentType: string;
    documentNumber: string;
    amountRequested: number;
    monthlyIncome: number;
}

export interface CreditHistoryResult {
    score: number;
    historySummary: string;
    raw: Record<string, any>;
}

export interface DebtInfoResult {
    totalDebt: number;
    monthlyDebt: number;
    debtRatio: number;
    raw: Record<string, any>;
}

export interface IncomeVerificationResult {
    incomeVerified: boolean;
    incomeConfidence: number;
    raw: Record<string, any>;
}

export interface IBankProvider {
    getProviderName(): string;
    consultCreditHistory(input: BankProviderRequest): CreditHistoryResult;
    getDebtInfo(input: BankProviderRequest): DebtInfoResult;
    verifyIncome(input: BankProviderRequest): IncomeVerificationResult;
}
