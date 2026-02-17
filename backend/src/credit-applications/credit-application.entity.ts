import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { EncryptionService } from '../common/encryption/encryption.service';

export enum Country {
    MX = 'MX', // Mexico
    CO = 'CO', // Colombia
    ES = 'ES', // Spain
}

export enum ApplicationStatus {
    DRAFT = 'DRAFT',
    PENDING_VALIDATION = 'PENDING_VALIDATION',
    VALIDATING = 'VALIDATING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

@Entity('credit_applications')
@Index('idx_credit_applications_country_status', ['country', 'status'])
@Index('idx_credit_applications_status', ['status'])
@Index('idx_credit_applications_created_at', ['createdAt'])
export class CreditApplication {
    // Inyección del servicio de encriptación
    private static encryptionService: EncryptionService;

    static setEncryptionService(service: EncryptionService): void {
        CreditApplication.encryptionService = service;
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: Country,
    })
    country: Country;

    @Column()
    fullName: string;

    @Column()
    documentType: string; // DNI, NIF, CURP, CC, CPF, Codice Fiscale

    @Column({ select: false }) // No mostrar por defecto en queries
    documentNumber: string; // Encriptado en producción

    @Column('decimal', { precision: 12, scale: 2 })
    amountRequested: number;

    @Column('decimal', { precision: 12, scale: 2 })
    monthlyIncome: number;

    @Column({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.DRAFT,
    })
    status: ApplicationStatus;

    @Column({ type: 'jsonb', nullable: true })
    bankProviderData: Record<string, any>; // Datos del proveedor bancario mock

    @Column({ type: 'jsonb', nullable: true })
    countryValidation: Record<string, any>; // Resultado de validaciones por país

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    riskScore: number; // Puntuación de riesgo (0-100)

    @Column({ type: 'text', nullable: true })
    rejectionReason: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: string; // ID del usuario (a implementar con auth)

    /**
     * Hook: Encriptar documentNumber antes de insertar
     */
    @BeforeInsert()
    async encryptDocumentOnInsert(): Promise<void> {
        if (this.documentNumber && CreditApplication.encryptionService) {
            this.documentNumber = CreditApplication.encryptionService.encrypt(
                this.documentNumber,
            );
        }
    }

    /**
     * Hook: Encriptar documentNumber antes de actualizar
     */
    @BeforeUpdate()
    async encryptDocumentOnUpdate(): Promise<void> {
        if (this.documentNumber && CreditApplication.encryptionService) {
            // Solo encriptar si comienza con caracteres normal (no es base64)
            if (!this.documentNumber.includes(':')) {
                this.documentNumber = CreditApplication.encryptionService.encrypt(
                    this.documentNumber,
                );
            }
        }
    }

    /**
     * Desencriptar documentNumber cuando es cargado explícitamente
     */
    getDecryptedDocument(): string | null {
        if (!this.documentNumber || !CreditApplication.encryptionService) {
            return null;
        }

        try {
            return CreditApplication.encryptionService.decrypt(this.documentNumber);
        } catch (error) {
            console.error('Error decrypting document:', error);
            return null;
        }
    }
}
