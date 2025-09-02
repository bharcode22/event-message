import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RabbitmqConnectionService } from './rabbitmq.connection';
import { TelegramBotServiceAdmin,  TelegramBotServicePod } from '../telegram-bot/telegram-bot.service';
import { CreateTaskListener, DeleteTaskListener } from './admin-listener/task.listener';
import { AdminInfoListener } from './admin-listener/admin.listener';
import { downloadFlowEditorJson, ApplyFlowEditorJson } from './admin-listener/flow.editor.json';
import { adminProcessId } from './admin-listener/process.id';
import { MinioUploadMusicEventListener, DetectSongDuration } from './admin-listener/minio.listener';
import { SaveFlowEditorAtPod, DeleteTaskAtPodListener } from './pod-listener/task.listener';
@Injectable()
export class RabbitmqListenerService implements OnApplicationBootstrap {
    constructor(
        private readonly rabbitmqService: RabbitmqConnectionService,
        private readonly telegramServiceAdmin: TelegramBotServiceAdmin,
        private readonly telegramServicePod: TelegramBotServicePod,
    ) {}

    async onApplicationBootstrap() {
        const channel = await this.rabbitmqService.waitForChannel();

        const listeners = [
            // admin listeners
            // { 
            //     exchange: process.env.PROCESS_ID_FLOW_EDITOR, 
            //     handler: new adminProcessId(this.telegramServiceAdmin) 
            // },
            // { 
            //     exchange: process.env.ADMIN_INFORMATION_EXCHANGE, 
            //     handler: new AdminInfoListener(this.telegramServiceAdmin) 
            // },
            { 
                exchange: process.env.DELETE_TASK2_EXCHANGE, 
                handler: new DeleteTaskListener(this.telegramServiceAdmin) 
            },
            { 
                exchange: process.env.CREATE_TASK2_EXCHANGE, 
                handler: new CreateTaskListener(this.telegramServiceAdmin) 
            },
            { 
                exchange: process.env.MINIO_TO_RABBITMQ, 
                handler: new MinioUploadMusicEventListener(this.telegramServiceAdmin) 
            },
            { 
                exchange: process.env.SONG_DURATION_EXCHANGE, 
                handler: new DetectSongDuration(this.telegramServiceAdmin) 
            },
            { 
                exchange: process.env.SAVE_FLOW_EDITOR_JSON, 
                handler: new downloadFlowEditorJson(this.telegramServiceAdmin) 
            },
            { 
                exchange: process.env.PUBLISH_EVENT_FLOW_EDITOR, 
                handler: new ApplyFlowEditorJson(this.telegramServiceAdmin) 
            },

            // pod listeners
            { 
                exchange: process.env.CONSUME_DELETE_FLOW_EDITOR_AT_POD, 
                handler: new DeleteTaskAtPodListener(this.telegramServicePod) 
            },
            { 
                exchange: process.env.SAVE_FLOW_EDITOR_JSON_AT_POD, 
                handler: new SaveFlowEditorAtPod(this.telegramServicePod) 
            },
        ].filter(l => l.exchange);

        for (const { exchange, handler } of listeners) {
            await handler.handle(channel, exchange!);
        }
    }
}
