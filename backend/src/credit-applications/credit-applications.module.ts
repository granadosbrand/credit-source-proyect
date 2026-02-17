import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditApplication } from './credit-application.entity';
import { CreditApplicationsService } from './credit-applications.service';
import { CreditApplicationsController } from './credit-applications.controller';
import { CountryRulesModule } from '../country-rules/country-rules.module';
import { BankProvidersModule } from '../bank-providers/bank-providers.module';
import { QueueModule } from '../queue/queue.module';
import { RedisModule } from '../redis/redis.module';
import { EncryptionModule } from '../common/encryption/encryption.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CreditApplication]),
        CountryRulesModule,
        BankProvidersModule,
        QueueModule,
        RedisModule,
        EncryptionModule,
        RealtimeModule,
    ],
    controllers: [CreditApplicationsController],
    providers: [CreditApplicationsService],
    exports: [CreditApplicationsService],
})
export class CreditApplicationsModule { }
