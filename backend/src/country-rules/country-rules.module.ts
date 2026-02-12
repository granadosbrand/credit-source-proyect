import { Module } from '@nestjs/common';
import { CountryRulesService } from './country-rules.service';

@Module({
    providers: [CountryRulesService],
    exports: [CountryRulesService],
})
export class CountryRulesModule { }
