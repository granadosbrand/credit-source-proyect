import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1708085200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasUsersTable = await queryRunner.hasTable('users');
        if (hasUsersTable) {
            return;
        }

        // Crear tabla users
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'passwordHash',
                        type: 'varchar',
                    },
                    {
                        name: 'role',
                        type: 'enum',
                        enum: ['USER', 'ADMIN'],
                        default: "'USER'",
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
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "idx_users_email"');
        await queryRunner.query('DROP TABLE IF EXISTS "users"');
    }
}
