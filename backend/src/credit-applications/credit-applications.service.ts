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

@Injectable()
export class CreditApplicationsService {
    constructor(
        @InjectRepository(CreditApplication)
        private readonly applicationsRepository: Repository<CreditApplication>,
        private readonly countryRulesService: CountryRulesService,
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
        let rejectionReason: string | undefined = undefined;

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
        const application = await this.applicationsRepository.findOne({
            where: { id },
        });

        if (!application) {
            throw new NotFoundException(`Solicitud ${id} no encontrada`);
        }

        application.status = dto.status;
        if (dto.rejectionReason) {
            application.rejectionReason = dto.rejectionReason;
        }

        const updated = await this.applicationsRepository.save(application);
        return CreditApplicationResponseDto.fromEntity(updated);
    }
}
