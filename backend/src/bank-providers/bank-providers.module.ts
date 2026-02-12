import { Module } from '@nestjs/common';
import { BankProvidersService } from './bank-providers.service';

@Module({
    providers: [BankProvidersService],
    exports: [BankProvidersService],
})
export class BankProvidersModule {}
