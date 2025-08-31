import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RabbitmqConnectionService } from './rabbitmq.connection';
import { TelegramBotServiceAdmin } from '../telegram-bot/telegram-bot.service';
import { CreateTaskListener, DeleteTaskListener } from './admin-listener/task.listener';
import { AdminInfoListener } from './admin-listener/admin.listener';
import { MinioUploadMusicEventListener, DetectSongDuration } from './admin-listener/minio.listener';

@Injectable()
export class RabbitmqListenerService implements OnApplicationBootstrap {
    constructor(
        private readonly rabbitmqService: RabbitmqConnectionService,
        private readonly telegramService: TelegramBotServiceAdmin,
    ) {}

    async onApplicationBootstrap() {
        const channel = await this.rabbitmqService.waitForChannel();

        const listeners = [
            { 
                exchange: process.env.DELETE_TASK2_EXCHANGE, 
                handler: new DeleteTaskListener(this.telegramService) 
            },
            { 
                exchange: process.env.CREATE_TASK2_EXCHANGE, 
                handler: new CreateTaskListener(this.telegramService) 
            },
            { 
                exchange: process.env.ADMIN_INFORMATION_EXCHANGE, 
                handler: new AdminInfoListener(this.telegramService) 
            },
            { 
                exchange: process.env.MINIO_TO_RABBITMQ, 
                handler: new MinioUploadMusicEventListener(this.telegramService) 
            },
            { 
                exchange: process.env.SONG_DURATION_EXCHANGE, 
                handler: new DetectSongDuration(this.telegramService) 
            },
        ].filter(l => l.exchange);

        for (const { exchange, handler } of listeners) {
            await handler.handle(channel, exchange!);
        }
    }
}
