import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCreditApplicationsTable1707000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('credit_applications');
        if (hasTable) {
            return;
        }

        await queryRunner.createTable(
            new Table({
                name: 'credit_applications',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'country',
                        type: 'enum',
                        enum: ['MX', 'CO', 'ES'],
                        enumName: 'credit_applications_country_enum',
                    },
                    {
                        name: 'fullName',
                        type: 'varchar',
                    },
                    {
                        name: 'documentType',
                        type: 'varchar',
                    },
                    {
                        name: 'documentNumber',
                        type: 'varchar',
                    },
                    {
                        name: 'amountRequested',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                    },
                    {
                        name: 'monthlyIncome',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            'DRAFT',
                            'PENDING_VALIDATION',
                            'VALIDATING',
                            'APPROVED',
                            'REJECTED',
                            'REVIEW_REQUIRED',
                        ],
                        enumName: 'credit_applications_status_enum',
                        default: "'DRAFT'",
                    },
                    {
                        name: 'bankProviderData',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'countryValidation',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'riskScore',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'rejectionReason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndices('credit_applications', [
            new TableIndex({
                name: 'idx_credit_applications_country_status',
                columnNames: ['country', 'status'],
            }),
            new TableIndex({
                name: 'idx_credit_applications_status',
                columnNames: ['status'],
            }),
            new TableIndex({
                name: 'idx_credit_applications_created_at',
                columnNames: ['createdAt'],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "credit_applications"');
        await queryRunner.query('DROP TYPE IF EXISTS "credit_applications_country_enum"');
        await queryRunner.query('DROP TYPE IF EXISTS "credit_applications_status_enum"');
    }
}
