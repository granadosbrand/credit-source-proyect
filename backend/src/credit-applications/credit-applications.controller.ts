import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    HttpCode,
} from '@nestjs/common';
import { CreditApplicationsService } from './credit-applications.service';
import {
    CreateCreditApplicationDto,
    CreditApplicationResponseDto,
    UpdateApplicationStatusDto,
} from './dtos/credit-application.dto';
import { Country, ApplicationStatus } from './credit-application.entity';

@Controller('api/credit-applications')
export class CreditApplicationsController {
    constructor(
        private readonly creditApplicationsService: CreditApplicationsService,
    ) { }

    @Post()
    @HttpCode(201)
    async create(
        @Body() dto: CreateCreditApplicationDto,
    ): Promise<CreditApplicationResponseDto> {
        return this.creditApplicationsService.create(dto);
    }

    @Get()
    async findAll(
        @Query('country') country?: Country,
        @Query('status') status?: ApplicationStatus,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.creditApplicationsService.findAll(
            country,
            status,
            limit || 50,
            offset || 0,
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<CreditApplicationResponseDto> {
        return this.creditApplicationsService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateApplicationStatusDto,
    ): Promise<CreditApplicationResponseDto> {
        return this.creditApplicationsService.updateStatus(id, dto);
    }
}
