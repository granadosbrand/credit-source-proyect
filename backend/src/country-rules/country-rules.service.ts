import { Injectable, BadRequestException } from '@nestjs/common';
import { Country } from '../credit-applications/credit-application.entity';
import {
    ICountryRule,
    CreateApplicationData,
} from './interfaces/country-rule.interface';
import { ValidationResult } from './interfaces/validation-result.interface';
import { MxCountryRule } from './rules/mx-country.rule';
import { CoCountryRule } from './rules/co-country.rule';
import { EsCountryRule } from './rules/es-country.rule';

export interface CountryValidationResult {
    documentValidation: ValidationResult;
    businessRulesValidation: ValidationResult;
    isValid: boolean;
    allErrors: string[];
    allWarnings: string[];
    metadata: Record<string, any>;
}

@Injectable()
export class CountryRulesService {
    private readonly rules: Map<Country, ICountryRule>;

    constructor() {
        this.rules = new Map<Country, ICountryRule>([
            [Country.MX, new MxCountryRule()],
            [Country.CO, new CoCountryRule()],
            [Country.ES, new EsCountryRule()],
        ]);
    }

    /**
     * Valida una solicitud de crédito según las reglas del país
     * @param country País de la solicitud
     * @param application Datos de la solicitud
     * @returns Resultado completo de validación
     */
    async validate(
        country: Country,
        application: CreateApplicationData,
    ): Promise<CountryValidationResult> {
        const rule = this.rules.get(country);

        if (!rule) {
            throw new BadRequestException(
                `País no soportado: ${country}. Países disponibles: ${Array.from(this.rules.keys()).join(', ')}`,
            );
        }

        // Validar documento
        const documentValidation = rule.validateDocument(
            application.documentType,
            application.documentNumber,
        );

        // Validar reglas de negocio
        const businessRulesValidation = rule.validateBusinessRules(application);

        // Combinar resultados
        const allErrors = [
            ...documentValidation.errors,
            ...businessRulesValidation.errors,
        ];

        const allWarnings = [
            ...(documentValidation.warnings || []),
            ...(businessRulesValidation.warnings || []),
        ];

        const metadata = {
            country,
            maxAmount: rule.getMaxAmount(),
            maxIncomeRatio: rule.getMaxIncomeRatio(),
            documentValidation: documentValidation.metadata || {},
            businessValidation: businessRulesValidation.metadata || {},
        };

        return {
            documentValidation,
            businessRulesValidation,
            isValid: allErrors.length === 0,
            allErrors,
            allWarnings,
            metadata,
        };
    }

    /**
     * Obtiene información sobre los límites y requisitos de un país
     */
    getCountryInfo(country: Country) {
        const rule = this.rules.get(country);

        if (!rule) {
            throw new BadRequestException(`País no soportado: ${country}`);
        }

        return {
            country,
            maxAmount: rule.getMaxAmount(),
            maxIncomeRatio: rule.getMaxIncomeRatio(),
        };
    }

    /**
     * Lista todos los países soportados con sus límites
     */
    getAllCountriesInfo() {
        return Array.from(this.rules.entries()).map(([country, rule]) => ({
            country,
            maxAmount: rule.getMaxAmount(),
            maxIncomeRatio: rule.getMaxIncomeRatio(),
        }));
    }
}
