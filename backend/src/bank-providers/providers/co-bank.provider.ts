import {
    BankProviderRequest,
    CreditHistoryResult,
    DebtInfoResult,
    IncomeVerificationResult,
    IBankProvider,
} from '../interfaces/bank-provider.interface';

export class CoBankProvider implements IBankProvider {
    getProviderName(): string {
        return 'COBankMock';
    }

    consultCreditHistory(input: BankProviderRequest): CreditHistoryResult {
        const ratio = this.getRatio(input.amountRequested, input.monthlyIncome);
        let score = 720 - Math.round(ratio * 18);
        if (ratio <= 4) {
            score += 25;
        } else if (ratio >= 8) {
            score -= 35;
        }

        score = this.clamp(score, 300, 850);

        return {
            score,
            historySummary: ratio <= 5 ? 'historial positivo' : 'historial mixto',
            raw: {
                scoreDC: score,
                obligaciones: ratio <= 5 ? 2 : 4,
                ratio,
            },
        };
    }

    getDebtInfo(input: BankProviderRequest): DebtInfoResult {
        const totalDebt = Number((input.amountRequested * 0.55).toFixed(2));
        const monthlyDebt = Number((totalDebt / 30).toFixed(2));
        const debtRatio = this.getRatio(monthlyDebt, input.monthlyIncome);

        return {
            totalDebt,
            monthlyDebt,
            debtRatio,
            raw: {
                currency: 'COP',
                termMonths: 30,
            },
        };
    }

    verifyIncome(input: BankProviderRequest): IncomeVerificationResult {
        const incomeVerified = input.monthlyIncome >= 1500000;
        const incomeConfidence = incomeVerified ? 0.78 : 0.4;

        return {
            incomeVerified,
            incomeConfidence,
            raw: {
                source: 'dian-mock',
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
