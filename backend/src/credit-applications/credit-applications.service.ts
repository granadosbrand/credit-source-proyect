import { Injectable, BadRequestException, NotFoundException, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditApplication, Country, ApplicationStatus } from './credit-application.entity';
import {
    CreateCreditApplicationDto,
    CreditApplicationResponseDto,
    CreditApplicationPublicDto,
    UpdateApplicationStatusDto,
} from './dtos/credit-application.dto';
import { CountryRulesService } from '../country-rules/country-rules.service';
import { BankProvidersService } from '../bank-providers/bank-providers.service';
import { RedisService } from '../redis/redis.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class CreditApplicationsService implements OnModuleInit {
    constructor(
        @InjectRepository(CreditApplication)
        private readonly applicationsRepository: Repository<CreditApplication>,
        private readonly countryRulesService: CountryRulesService,
        private readonly bankProvidersService: BankProvidersService,
        private readonly redisService: RedisService,
        private readonly encryptionService: EncryptionService,
        @Inject(RealtimeGateway)
        private readonly realtimeGateway: RealtimeGateway,
    ) { }

    /**
     * En el inicialización del módulo, setear el servicio de encriptación en la entity
     */
    onModuleInit(): void {
        CreditApplication.setEncryptionService(this.encryptionService);
    }

    /**
     * Generar clave de cache para findAll
     */
    private getCacheKeyForFindAll(country?: Country, status?: ApplicationStatus, limit?: number, offset?: number): string {
        const parts = ['credit-apps-list'];
        if (country) parts.push(`country:${country}`);
        if (status) parts.push(`status:${status}`);
        if (limit) parts.push(`limit:${limit}`);
        if (offset) parts.push(`offset:${offset}`);
        return parts.join(':');
    }

    /**
     * Generar clave de cache para findOne
     */
    private getCacheKeyForFindOne(id: string): string {
        return `credit-app:${id}`;
    }

    /**
     * Método público para invalidar cache de una aplicación específica
     * Usado por processors, webhooks y otros servicios
     */
    async invalidateCacheForApplication(id: string, country?: Country, status?: ApplicationStatus): Promise<void> {
        const keysToInvalidate = [
            this.getCacheKeyForFindOne(id),
            this.getCacheKeyForFindAll(),
        ];

        if (country) {
            keysToInvalidate.push(this.getCacheKeyForFindAll(country));
        }

        await this.redisService.delMany(keysToInvalidate);

        // Invalidar TODOS los keys que contengan "credit-apps-list:country:X"
        // para cubrir todas las combinaciones de status/limit/offset
        if (country) {
            await this.redisService.delByPattern(`credit-apps-list:country:${country}*`);
        }
    }

    async create(
        dto: CreateCreditApplicationDto,
        userId: string,
    ): Promise<CreditApplicationResponseDto> {
        // Validar país
        if (!Object.values(Country).includes(dto.country)) {
            throw new BadRequestException(`País no soportado: ${dto.country}`);
        }

        if (!dto.amountRequested || dto.amountRequested <= 0) {
            throw new BadRequestException(`Monto solicitado inválido: ${dto.amountRequested}`);
        }

        console.log("full dto: ", dto)

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
            createdBy: userId,
            countryValidation: {
                isValid: validation.isValid,
                errors: validation.allErrors,
                warnings: validation.allWarnings,
                ...validation.metadata,
            },
        });

        const saved = await this.applicationsRepository.save(application);

        // Invalidar cache de listados (keys exactas + patrón para cubrir todas las combinaciones)
        const keysToInvalidate = [
            this.getCacheKeyForFindAll(),
            this.getCacheKeyForFindAll(dto.country),
        ];
        await this.redisService.delMany(keysToInvalidate);
        await this.redisService.delByPattern(`credit-apps-list:country:${dto.country}*`);

        // Emitir evento WebSocket para actualización en tiempo real
        this.realtimeGateway.emitApplicationCreated({
            applicationId: saved.id,
            country: saved.country,
            fullName: saved.fullName,
            status: saved.status,
            amountRequested: Number(saved.amountRequested),
            timestamp: new Date().toISOString(),
        });

        return CreditApplicationResponseDto.fromEntity(saved);
    }

    async findAll(
        country?: Country,
        status?: ApplicationStatus,
        limit = 50,
        offset = 0,
        userId?: string,
        userRole?: string,
    ): Promise<{ data: CreditApplicationPublicDto[]; total: number }> {
        // Intentar obtener del cache (TTL 5 minutos)
        const cacheKey = this.getCacheKeyForFindAll(country, status, limit, offset);
        const cached = await this.redisService.get<{
            data: CreditApplicationPublicDto[];
            total: number;
        }>(cacheKey);

        if (cached) {
            return cached;
        }

        const query = this.applicationsRepository.createQueryBuilder('app');

        // Todos los usuarios ven todas las solicitudes (MVP)
        // La diferencia es que solo ADMIN puede cambiar estados (controlado en controller)
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

        const result = {
            data: applications.map((app) => CreditApplicationPublicDto.fromEntity(app)),
            total,
        };

        // Guardar en cache (300 segundos = 5 minutos)
        await this.redisService.set(cacheKey, result, 300);

        return result;
    }

    /**
     * Obtener entity completo de una solicitud (para validaciones internas)
     * No cachea porque retorna el entity completo con datos sensibles
     */
    async findOneById(id: string): Promise<CreditApplication> {
        const application = await this.applicationsRepository.findOne({
            where: { id },
        });

        if (!application) {
            throw new NotFoundException(`Solicitud ${id} no encontrada`);
        }

        return application;
    }

    async findOne(id: string): Promise<CreditApplicationResponseDto> {
        // Intentar obtener del cache
        const cacheKey = this.getCacheKeyForFindOne(id);
        const cached = await this.redisService.get<CreditApplicationResponseDto>(cacheKey);


        if (cached) {
            return cached;
        }

        const application = await this.applicationsRepository.findOne({
            where: { id },
        });

        if (!application) {
            throw new NotFoundException(`Solicitud ${id} no encontrada`);
        }

        const result = CreditApplicationResponseDto.fromEntity(application);

        // Guardar en cache (300 segundos = 5 minutos)
        await this.redisService.set(cacheKey, result, 300);

        return result;
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

        // Guardar status original ANTES de mutar para el evento WebSocket
        const previousStatus = application.status;

        application.status = dto.status;
        if (dto.rejectionReason) {
            application.rejectionReason = dto.rejectionReason;
        }

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

        // Invalidar caches relacionados después de guardar
        // Usar método que cubre TODAS las combinaciones de parametros
        await this.invalidateCacheForApplication(id, updated.country, updated.status);

        // Emitir evento WebSocket para actualización en tiempo real
        this.realtimeGateway.emitStatusChange({
            applicationId: updated.id,
            oldStatus: previousStatus,
            newStatus: updated.status,
            country: updated.country,
            riskScore: updated.riskScore !== null ? Number(updated.riskScore) : undefined,
            timestamp: new Date().toISOString(),
        });

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
