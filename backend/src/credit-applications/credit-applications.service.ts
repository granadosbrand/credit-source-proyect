import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditApplication, Country, ApplicationStatus } from './credit-application.entity';
import {
    CreateCreditApplicationDto,
    CreditApplicationResponseDto,
    UpdateApplicationStatusDto,
} from './dtos/credit-application.dto';

@Injectable()
export class CreditApplicationsService {
    constructor(
        @InjectRepository(CreditApplication)
        private readonly applicationsRepository: Repository<CreditApplication>,
    ) { }

    async create(
        dto: CreateCreditApplicationDto,
    ): Promise<CreditApplicationResponseDto> {
        // Validar país
        if (!Object.values(Country).includes(dto.country)) {
            throw new BadRequestException(`País no soportado: ${dto.country}`);
        }

        if(!dto.amountRequested || dto.amountRequested <= 0) {
            throw new BadRequestException(`Monto solicitado inválido: ${dto.amountRequested}`);
        }

        // Crear nueva solicitud
        const application = this.applicationsRepository.create({
            country: dto.country,
            fullName: dto.fullName,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            amountRequested: dto.amountRequested,
            monthlyIncome: dto.monthlyIncome,
            status: ApplicationStatus.DRAFT,
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
