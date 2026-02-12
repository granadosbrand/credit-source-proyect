import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditApplication, Country, ApplicationStatus } from './credit-application.entity';
import {
    CreateCreditApplicationDto,
    CreditApplicationResponseDto,
    UpdateApplicationStatusDto,
} from './dtos/credit-application.dto';
import { CountryRulesService } from '../country-rules/country-rules.service';
import { BankProvidersService } from '../bank-providers/bank-providers.service';

@Injectable()
export class CreditApplicationsService {
    constructor(
        @InjectRepository(CreditApplication)
        private readonly applicationsRepository: Repository<CreditApplication>,
        private readonly countryRulesService: CountryRulesService,
        private readonly bankProvidersService: BankProvidersService,
    ) { }

    async create(
        dto: CreateCreditApplicationDto,
    ): Promise<CreditApplicationResponseDto> {
        // Validar país
        if (!Object.values(Country).includes(dto.country)) {
            throw new BadRequestException(`País no soportado: ${dto.country}`);
        }

        if (!dto.amountRequested || dto.amountRequested <= 0) {
            throw new BadRequestException(`Monto solicitado inválido: ${dto.amountRequested}`);
        }

        // Validar con reglas de país
        const validation = await this.countryRulesService.validate(dto.country, {
            country: dto.country,
            fullName: dto.fullName,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            amountRequested: dto.amountRequested,
            monthlyIncome: dto.monthlyIncome,
        });

        // Determinar estado inicial basado en validación
        let status = ApplicationStatus.DRAFT;
        let rejectionReason: string | null = null;

        if (!validation.isValid) {
            status = ApplicationStatus.REJECTED;
            rejectionReason = validation.allErrors.join('; ');
        } else if (validation.allWarnings.length > 0) {
            status = ApplicationStatus.REVIEW_REQUIRED;
        } else {
            status = ApplicationStatus.PENDING_VALIDATION;
        }

        // Crear nueva solicitud con resultados de validación
        const application = this.applicationsRepository.create({
            country: dto.country,
            fullName: dto.fullName,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            amountRequested: dto.amountRequested,
            monthlyIncome: dto.monthlyIncome,
            status,
            rejectionReason,
            countryValidation: {
                isValid: validation.isValid,
                errors: validation.allErrors,
                warnings: validation.allWarnings,
                ...validation.metadata,
            },
        });

        const saved = await this.applicationsRepository.save(application);
        return CreditApplicationResponseDto.fromEntity(saved);
    }

    async findAll(
        country?: Country,
        status?: ApplicationStatus,
        limit = 50,
        offset = 0,
    ): Promise<{ data: CreditApplicationResponseDto[]; total: number }> {
        const query = this.applicationsRepository.createQueryBuilder('app');

        if (country) {
            query.where('app.country = :country', { country });
        }

        if (status) {
            query.andWhere('app.status = :status', { status });
        }

        const total = await query.getCount();
        const applications = await query
            .orderBy('app.createdAt', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();

        return {
            data: applications.map((app) =>
                CreditApplicationResponseDto.fromEntity(app),
            ),
            total,
        };
    }

    async findOne(id: string): Promise<CreditApplicationResponseDto> {
        const application = await this.applicationsRepository.findOne({
            where: { id },
        });

        if (!application) {
            throw new NotFoundException(`Solicitud ${id} no encontrada`);
        }

        return CreditApplicationResponseDto.fromEntity(application);
    }

    async updateStatus(
        id: string,
        dto: UpdateApplicationStatusDto,
    ): Promise<CreditApplicationResponseDto> {
        const application = await this.applicationsRepository
            .createQueryBuilder('app')
            .addSelect('app.documentNumber')
            .where('app.id = :id', { id })
            .getOne();

        if (!application) {
            throw new NotFoundException(`Solicitud ${id} no encontrada`);
        }

        application.status = dto.status;
        if (dto.rejectionReason) {
            application.rejectionReason = dto.rejectionReason;
        }

        console.log("application", application);

        if (dto.status === ApplicationStatus.VALIDATING) {
            const providerResult = this.bankProvidersService.consult(
                application.country,
                {
                    country: application.country,
                    fullName: application.fullName,
                    documentType: application.documentType,
                    documentNumber: application.documentNumber,
                    amountRequested: application.amountRequested,
                    monthlyIncome: application.monthlyIncome,
                },
            );

            application.bankProviderData = providerResult;
            application.riskScore = providerResult.normalizedScore;

            const decision = this.decideFromProvider(providerResult);
            application.status = decision.status;

            if (decision.rejectionReason) {
                application.rejectionReason = decision.rejectionReason;
            } else if (decision.status !== ApplicationStatus.REJECTED) {
                application.rejectionReason = null;
            }
        }

        const updated = await this.applicationsRepository.save(application);
        return CreditApplicationResponseDto.fromEntity(updated);
    }

    private decideFromProvider(providerResult: {
        riskLevel: 'low' | 'medium' | 'high';
        normalizedScore: number;
        incomeVerified: boolean;
        score: number;
    }): { status: ApplicationStatus; rejectionReason?: string } {
        if (!providerResult.incomeVerified) {
            return {
                status: ApplicationStatus.REVIEW_REQUIRED,
            };
        }

        if (providerResult.riskLevel === 'high' || providerResult.normalizedScore < 45) {
            return {
                status: ApplicationStatus.REJECTED,
                rejectionReason: `Riesgo alto segun proveedor bancario (score: ${providerResult.score})`,
            };
        }

        if (providerResult.riskLevel === 'medium' || providerResult.normalizedScore < 65) {
            return {
                status: ApplicationStatus.REVIEW_REQUIRED,
            };
        }

        return {
            status: ApplicationStatus.APPROVED,
        };
    }
}
