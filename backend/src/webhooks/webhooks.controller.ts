import { Body, Controller, Logger, Post } from '@nestjs/common';

@Controller('api/webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    @Post('bank-decision')
    async receiveBankDecision(@Body() payload: Record<string, unknown>) {
        this.logger.log(`Webhook received: bank-decision`);
        this.logger.debug(JSON.stringify(payload));

        return {
            received: true,
        };
    }
}
