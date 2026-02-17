import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeUsersUsernameAndSeedMocks1708085400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasUsersTable = await queryRunner.hasTable('users');
        if (!hasUsersTable) {
            return;
        }

        const usersTable = await queryRunner.getTable('users');
        const hasUsername = usersTable?.columns.some((column) => column.name === 'username');
        const hasEmail = usersTable?.columns.some((column) => column.name === 'email');

        if (!hasUsername && hasEmail) {
            await queryRunner.query('ALTER TABLE "users" RENAME COLUMN "email" TO "username"');
        }

        await queryRunner.query('DROP INDEX IF EXISTS "idx_users_email"');
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username")');

        await queryRunner.query(`
            INSERT INTO "users" ("username", "passwordHash", "role")
            VALUES
                ('user', '$2b$10$wTOUjX5ZgnOKmAOzPkx9GutmdRdbAuZMyYox/Bm34ElkOV5DcZmBe', 'USER'),
                ('admin', '$2b$10$1bXTWxweI5h0qyLKkYxnwujRy21Muiowap52QcwCACvK2Rjex2TPm', 'ADMIN')
            ON CONFLICT ("username") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasUsersTable = await queryRunner.hasTable('users');
        if (!hasUsersTable) {
            return;
        }

        await queryRunner.query('DELETE FROM "users" WHERE "username" IN (\'user\', \'admin\')');
        await queryRunner.query('DROP INDEX IF EXISTS "idx_users_username"');

        const usersTable = await queryRunner.getTable('users');
        const hasUsername = usersTable?.columns.some((column) => column.name === 'username');
        const hasEmail = usersTable?.columns.some((column) => column.name === 'email');

        if (hasUsername && !hasEmail) {
            await queryRunner.query('ALTER TABLE "users" RENAME COLUMN "username" TO "email"');
        }

        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email")');
    }
}
