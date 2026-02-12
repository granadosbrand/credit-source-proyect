import { BadRequestException, Injectable } from '@nestjs/common';
import { Country } from '../credit-applications/credit-application.entity';
import {
    BankProviderRequest,
    IBankProvider,
} from './interfaces/bank-provider.interface';
import { ProviderResult, RiskLevel } from './interfaces/provider-result.interface';
import { MxBankProvider } from './providers/mx-bank.provider';
import { CoBankProvider } from './providers/co-bank.provider';
import { EsBankProvider } from './providers/es-bank.provider';

@Injectable()
export class BankProvidersService {
    private readonly providers: Map<Country, IBankProvider>;

    constructor() {
        this.providers = new Map<Country, IBankProvider>([
            [Country.MX, new MxBankProvider()],
            [Country.CO, new CoBankProvider()],
            [Country.ES, new EsBankProvider()],
        ]);
    }

    consult(country: Country, input: BankProviderRequest): ProviderResult {
        const provider = this.providers.get(country);

        if (!provider) {
            throw new BadRequestException(
                `Proveedor bancario no soportado para: ${country}`,
            );
        }

        const creditHistory = provider.consultCreditHistory(input);
        const debtInfo = provider.getDebtInfo(input);
        const incomeVerification = provider.verifyIncome(input);

        const normalizedScore = this.normalizeScore(creditHistory.score);
        const riskLevel = this.getRiskLevel(creditHistory.score);

        return {
            provider: provider.getProviderName(),
            country,
            score: creditHistory.score,
            normalizedScore,
            riskLevel,
            totalDebt: debtInfo.totalDebt,
            monthlyDebt: debtInfo.monthlyDebt,
            incomeVerified: incomeVerification.incomeVerified,
            raw: {
                creditHistory,
                debtInfo,
                incomeVerification,
            },
        };
    }

    private normalizeScore(score: number): number {
        const clamped = Math.max(300, Math.min(850, score));
        return Math.round(((clamped - 300) / 550) * 100);
    }

    private getRiskLevel(score: number): RiskLevel {
        if (score >= 720) {
            return 'low';
        }
        if (score >= 620) {
            return 'medium';
        }
        return 'high';
    }
}
