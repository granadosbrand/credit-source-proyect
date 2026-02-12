import {
    BankProviderRequest,
    CreditHistoryResult,
    DebtInfoResult,
    IncomeVerificationResult,
    IBankProvider,
} from '../interfaces/bank-provider.interface';

export class EsBankProvider implements IBankProvider {
    getProviderName(): string {
        return 'ESBankMock';
    }

    consultCreditHistory(input: BankProviderRequest): CreditHistoryResult {
        const ratio = this.getRatio(input.amountRequested, input.monthlyIncome);
        let score = 740 - Math.round(ratio * 22);
        if (ratio <= 3) {
            score += 30;
        } else if (ratio >= 6) {
            score -= 30;
        }

        score = this.clamp(score, 300, 850);

        return {
            score,
            historySummary: ratio <= 4 ? 'historial estable' : 'historial en observacion',
            raw: {
                riskRating: score >= 700 ? 'A' : score >= 620 ? 'B' : 'C',
                debtRatio: ratio,
            },
        };
    }

    getDebtInfo(input: BankProviderRequest): DebtInfoResult {
        const totalDebt = Number((input.amountRequested * 0.5).toFixed(2));
        const monthlyDebt = Number((totalDebt / 20).toFixed(2));
        const debtRatio = this.getRatio(monthlyDebt, input.monthlyIncome);

        return {
            totalDebt,
            monthlyDebt,
            debtRatio,
            raw: {
                currency: 'EUR',
                termMonths: 20,
            },
        };
    }

    verifyIncome(input: BankProviderRequest): IncomeVerificationResult {
        const incomeVerified = input.monthlyIncome >= 1200;
        const incomeConfidence = incomeVerified ? 0.85 : 0.5;

        return {
            incomeVerified,
            incomeConfidence,
            raw: {
                source: 'aeat-mock',
                declaredMonthlyIncome: input.monthlyIncome,
            },
        };
    }

    private getRatio(numerator: number, denominator: number): number {
        if (!denominator || denominator <= 0) {
            return 99;
        }
        return Number((numerator / denominator).toFixed(2));
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}
