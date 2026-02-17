import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1708085200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasUsersTable = await queryRunner.hasTable('users');

        if (!hasUsersTable) {
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
                            name: 'username',
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

        const usersTable = await queryRunner.getTable('users');
        const hasUsername = usersTable?.columns.some((column) => column.name === 'username');
        const hasEmail = usersTable?.columns.some((column) => column.name === 'email');

        // Seed usuarios mock para acelerar review (idempotente)
        if (hasUsername) {
            await queryRunner.query(`
                INSERT INTO "users" ("username", "passwordHash", "role")
                VALUES
                    ('user', '$2b$10$wTOUjX5ZgnOKmAOzPkx9GutmdRdbAuZMyYox/Bm34ElkOV5DcZmBe', 'USER'),
                    ('admin', '$2b$10$1bXTWxweI5h0qyLKkYxnwujRy21Muiowap52QcwCACvK2Rjex2TPm', 'ADMIN')
                ON CONFLICT ("username") DO NOTHING
            `);
        } else if (hasEmail) {
            await queryRunner.query(`
                INSERT INTO "users" ("email", "passwordHash", "role")
                VALUES
                    ('user', '$2b$10$wTOUjX5ZgnOKmAOzPkx9GutmdRdbAuZMyYox/Bm34ElkOV5DcZmBe', 'USER'),
                    ('admin', '$2b$10$1bXTWxweI5h0qyLKkYxnwujRy21Muiowap52QcwCACvK2Rjex2TPm', 'ADMIN')
                ON CONFLICT ("email") DO NOTHING
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "idx_users_username"');
        await queryRunner.query('DROP TABLE IF EXISTS "users"');
    }
}
