import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    HttpCode,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { CreditApplicationsService } from './credit-applications.service';
import {
    CreateCreditApplicationDto,
    CreditApplicationResponseDto,
    CreditApplicationPublicDto,
    UpdateApplicationStatusDto,
} from './dtos/credit-application.dto';
import { Country, ApplicationStatus } from './credit-application.entity';
import { JwtAuthGuard, RolesGuard, Roles } from '../common/guards';
import { UserRole } from '../auth/entities/user.entity';

@Controller('api/credit-applications')
@UseGuards(JwtAuthGuard)
export class CreditApplicationsController {
    constructor(
        private readonly creditApplicationsService: CreditApplicationsService,
    ) { }

    @Post()
    @HttpCode(201)
    async create(
        @Body() dto: CreateCreditApplicationDto,
        @Request() req: any,
    ): Promise<CreditApplicationResponseDto> {
        const userId = req.user.userId;
        return this.creditApplicationsService.create(dto, userId);
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
    async findOne(
        @Param('id') id: string,
        @Request() req: any,
    ): Promise<CreditApplicationPublicDto> {

        const userId = req.user.userId;
        const userRole = req.user.role;

        // Obtener la aplicación
        const application = await this.creditApplicationsService.findOneById(id);

        // Si no es admin y no es su solicitud, denegar acceso
        if (userRole !== UserRole.ADMIN && application.createdBy !== userId) {
            throw new ForbiddenException('No tienes acceso a esta solicitud');
        }

        return this.creditApplicationsService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles([UserRole.ADMIN])
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateApplicationStatusDto,
    ): Promise<CreditApplicationResponseDto> {
        return this.creditApplicationsService.updateStatus(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(
        @Param('id') id: string,
        @Request() req: any,
    ): Promise<void> {
        const userId = req.user.userId;
        const userRole = req.user.role;

        const application = await this.creditApplicationsService.findOneById(id);

        if (userRole !== UserRole.ADMIN && application.createdBy !== userId) {
            throw new ForbiddenException('No tienes acceso a esta solicitud');
        }

        await this.creditApplicationsService.remove(id);
    }
}

