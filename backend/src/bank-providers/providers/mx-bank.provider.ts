import {
    BankProviderRequest,
    CreditHistoryResult,
    DebtInfoResult,
    IncomeVerificationResult,
    IBankProvider,
} from '../interfaces/bank-provider.interface';

export class MxBankProvider implements IBankProvider {
    getProviderName(): string {
        return 'MXBankMock';
    }

    consultCreditHistory(input: BankProviderRequest): CreditHistoryResult {
        const ratio = this.getRatio(input.amountRequested, input.monthlyIncome);
        let score = 760 - Math.round(ratio * 20);
        if (ratio <= 5) {
            score += 20;
        } else if (ratio >= 10) {
            score -= 40;
        }

        score = this.clamp(score, 300, 850);

        return {
            score,
            historySummary: ratio <= 6 ? 'historial estable' : 'historial con alertas',
            raw: {
                bureau: 'BCMX',
                alertLevel: ratio <= 6 ? 'low' : 'medium',
                ratio,
            },
        };
    }

    getDebtInfo(input: BankProviderRequest): DebtInfoResult {
        const totalDebt = Number((input.amountRequested * 0.6).toFixed(2));
        const monthlyDebt = Number((totalDebt / 24).toFixed(2));
        const debtRatio = this.getRatio(monthlyDebt, input.monthlyIncome);

        return {
            totalDebt,
            monthlyDebt,
            debtRatio,
            raw: {
                debtType: 'consumo',
                termMonths: 24,
            },
        };
    }

    verifyIncome(input: BankProviderRequest): IncomeVerificationResult {
        const incomeVerified = input.monthlyIncome >= 2000;
        const incomeConfidence = incomeVerified ? 0.82 : 0.45;

        return {
            incomeVerified,
            incomeConfidence,
            raw: {
                source: 'sat-mock',
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
