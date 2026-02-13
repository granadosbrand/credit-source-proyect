import { Module } from '@nestjs/common';
import { PgNotifyListenerService } from './pg-notify-listener.service';
import { QueueModule } from '../../queue/queue.module';
import { RealtimeModule } from '../../realtime/realtime.module';

@Module({
    imports: [QueueModule, RealtimeModule],
    providers: [PgNotifyListenerService],
    exports: [PgNotifyListenerService],
})
export class DatabaseListenersModule { }
