import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditApplication } from './credit-application.entity';
import { CreditApplicationsService } from './credit-applications.service';
import { CreditApplicationsController } from './credit-applications.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CreditApplication])],
    controllers: [CreditApplicationsController],
    providers: [CreditApplicationsService],
    exports: [CreditApplicationsService],
})
export class CreditApplicationsModule { }
