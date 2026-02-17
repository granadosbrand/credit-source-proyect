import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreditApplicationsModule } from './credit-applications/credit-applications.module';
import { DatabaseListenersModule } from './database/listeners/database-listeners.module';
import { RealtimeModule } from './realtime/realtime.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    CreditApplicationsModule,
    DatabaseListenersModule,
    RealtimeModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
