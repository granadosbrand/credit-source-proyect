import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCreatedByToCreditApplications1708085300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('credit_applications');
        const createdByColumn = table?.columns.find((column) => column.name === 'createdBy');
        const hasCreatedBy = Boolean(createdByColumn);

        // Agregar columna createdBy a credit_applications solo si no existe
        if (!hasCreatedBy) {
            await queryRunner.addColumn(
                'credit_applications',
                new TableColumn({
                    name: 'createdBy',
                    type: 'uuid',
                    isNullable: true, // Nullable inicialmente para datos existentes
                }),
            );
        } else {
            const normalizedType = (createdByColumn?.type || '').toLowerCase();

            // Si la columna existe pero no es UUID (caso legacy por synchronize), convertirla
            if (normalizedType !== 'uuid') {
                await queryRunner.query(`
                    UPDATE "credit_applications"
                    SET "createdBy" = NULL
                    WHERE "createdBy" IS NOT NULL
                      AND (
                        "createdBy" = ''
                        OR "createdBy" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                      )
                `);

                await queryRunner.query(`
                    ALTER TABLE "credit_applications"
                    ALTER COLUMN "createdBy" TYPE uuid
                    USING "createdBy"::uuid
                `);
            }
        }

        const refreshedTable = await queryRunner.getTable('credit_applications');
        const hasForeignKey = refreshedTable?.foreignKeys.some(
            (fk) => fk.name === 'fk_credit_applications_created_by',
        );

        // Agregar foreign key a users solo si no existe
        if (!hasForeignKey) {
            await queryRunner.createForeignKey(
                'credit_applications',
                new TableForeignKey({
                    columnNames: ['createdBy'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'users',
                    onDelete: 'SET NULL',
                    name: 'fk_credit_applications_created_by',
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover foreign key
        const table = await queryRunner.getTable('credit_applications');
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.name === 'fk_credit_applications_created_by',
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('credit_applications', foreignKey);
        }

        // Remover columna
        const hasCreatedBy = table?.columns.some((column) => column.name === 'createdBy');
        if (hasCreatedBy) {
            await queryRunner.dropColumn('credit_applications', 'createdBy');
        }
    }
}
