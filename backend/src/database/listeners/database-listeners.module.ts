import { Module } from '@nestjs/common';
import { PgNotifyListenerService } from './pg-notify-listener.service';
import { QueueModule } from '../../queue/queue.module';

@Module({
    imports: [QueueModule],
    providers: [PgNotifyListenerService],
    exports: [PgNotifyListenerService],
})
export class DatabaseListenersModule { }
