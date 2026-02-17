import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStatusChangeTrigger1707747600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('credit_applications');
        if (!hasTable) {
            return;
        }

        // Create the function that sends notifications
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION notify_status_change()
            RETURNS TRIGGER AS $$
            DECLARE
                payload JSONB;
            BEGIN
                -- Only notify if status actually changed
                IF OLD.status IS DISTINCT FROM NEW.status THEN
                    payload := jsonb_build_object(
                        'application_id', NEW.id,
                        'old_status', OLD.status,
                        'new_status', NEW.status,
                        'country', NEW.country,
                        'amount_requested', NEW."amountRequested",
                        'risk_score', NEW."riskScore",
                        'timestamp', NOW()
                    );
                    
                    PERFORM pg_notify('application_changes', payload::text);
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Drop trigger if it exists to avoid duplicates
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS application_status_change_trigger 
            ON credit_applications;
        `);

        // Create the trigger
        await queryRunner.query(`
            CREATE TRIGGER application_status_change_trigger
            AFTER UPDATE ON credit_applications
            FOR EACH ROW
            EXECUTE FUNCTION notify_status_change();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('credit_applications');

        // Rollback: drop trigger and function
        if (hasTable) {
            await queryRunner.query(`
                DROP TRIGGER IF EXISTS application_status_change_trigger 
                ON credit_applications;
            `);
        }

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS notify_status_change();
        `);
    }
}
