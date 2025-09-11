import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RabbitmqConnectionService, RabbitmqGlobalConnectionService } from './rabbitmq.connection';
import { TelegramBotServiceAdmin,  TelegramBotServicePod } from '../telegram-bot/telegram-bot.service';

// admin
import { CreateTaskListener, DeleteTaskListener } from './admin-listener/task.listener';
import { downloadFlowEditorJson, ApplyFlowEditorJson } from './admin-listener/flow.editor.json';
import { MinioUploadMusicEventListener, DetectSongDuration } from './admin-listener/minio.listener';
import { flowEditorFileListener } from './admin-listener/flow.editor.file.listener';

// pod
import { SaveFlowEditorAtPod, DeleteTaskAtPodListener } from './pod-listener/task.listener';
import { InfoFlowEditorFile } from './pod-listener/info.flow.editor.file';
import { DockerEventListener } from './pod-listener/docker.event.listener';
import { SaveMultimnediaFile, SaveMultimnediaFileExist, SaveMultimediaFileEvent } from './pod-listener/multimedia.listener';
import { SaveSoundTaskFile, SaveSoundTaskFileExist, SaveSoundTaskFileEvent } from './pod-listener/sound.task.listener';
import { IsReloadStatus } from './pod-listener/is.reload.status';

// self dev
import { 
    InfoCreateSelfDev, 
    InfoUpdateSelfDev, 
    InfoDeleteSelfDev, 
    InfoCreateSelfDevSound, 
    InfoUpdateSelfDevSound, 
    InfoDeleteSelfDevSound
} from './pod-listener/info.self.development';

// experience
import { 
    InfoCreateExperience, 
    InfoUpdateExperience, 
    InfoDeleteExperience, 
    InfoCreateDetailExperience, 
    InfoUpdateDetailExperience, 
    InfoDeleteDetailExperience, 
} from './pod-listener/info.experience';

@Injectable()
export class RabbitmqListenerService implements OnApplicationBootstrap {
    constructor(
        private readonly rabbitmqService: RabbitmqConnectionService,
        private readonly rabbitmqGlobalService: RabbitmqGlobalConnectionService,
        private readonly telegramServiceAdmin: TelegramBotServiceAdmin,
        private readonly telegramServicePod: TelegramBotServicePod,
    ) {}

    async onApplicationBootstrap() {
        const globalChannel = await this.rabbitmqGlobalService.waitForChannel();
        const channel = await this.rabbitmqService.waitForChannel();

        const globalListener = [
            { 
                exchange: process.env.MINIO_TO_RABBITMQ, 
                handler: new MinioUploadMusicEventListener(this.telegramServiceAdmin) 
            },
        ];

        const SpesifikListeners = [
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
            { 
                exchange: process.env.IMAGE_EVENT, 
                handler: new flowEditorFileListener(this.telegramServiceAdmin) 
            },

            // pod listeners
            // { 
            //     exchange: process.env.INFO_DOWNLOAD_MULMED_EXIST, 
            //     handler: new SaveMultimnediaFileExist(this.telegramServicePod) 
            // },
            // { 
            //     exchange: process.env.INFO_DOWNLOAD_SOUND_TASK_EXIST, 
            //     handler: new SaveSoundTaskFileExist(this.telegramServicePod) 
            // },
            {
                exchange: process.env.CONSUME_DELETE_FLOW_EDITOR_AT_POD, 
                handler: new DeleteTaskAtPodListener(this.telegramServicePod) 
            },
            { 
                exchange: process.env.SAVE_FLOW_EDITOR_JSON_AT_POD, 
                handler: new SaveFlowEditorAtPod(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_FLOW_EDITOR_FILE, 
                handler: new InfoFlowEditorFile(this.telegramServicePod) 
            },
            { 
                exchange: process.env.DOCKER_EVENTS, 
                handler: new DockerEventListener(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_DOWNLOAD_MULMED, 
                handler: new SaveMultimnediaFile(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_DOWNLOAD_MULMED_EVENT, 
                handler: new SaveMultimediaFileEvent(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_DOWNLOAD_SOUND_TASK, 
                handler: new SaveSoundTaskFile(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_DOWNLOAD_SOUND_TASK_EVENT, 
                handler: new SaveSoundTaskFileEvent(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_IS_RELOAD_STATUS, 
                handler: new IsReloadStatus(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_CREATE_SELF_DEV, 
                handler: new InfoCreateSelfDev(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_UPDATE_SELF_DEV, 
                handler: new InfoUpdateSelfDev(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_DELETE_SELF_DEV, 
                handler: new InfoDeleteSelfDev(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_CREATE_SELF_DEV_SOUND, 
                handler: new InfoCreateSelfDevSound(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_UPDATE_SELF_DEV_SOUND, 
                handler: new InfoUpdateSelfDevSound(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_DELETE_SELF_DEV_SOUND, 
                handler: new InfoDeleteSelfDevSound(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_CREATE_EXP, 
                handler: new InfoCreateExperience(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_UPDATE_EXP, 
                handler: new InfoUpdateExperience(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_DELETE_EXP, 
                handler: new InfoDeleteExperience(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_CREATE_DETAIL_EXP, 
                handler: new InfoCreateDetailExperience(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_UPDATE_DETAIL_EXP, 
                handler: new InfoUpdateDetailExperience(this.telegramServicePod) 
            },
            { 
                exchange: process.env.INFO_PUBLISH_DELETE_DETAIL_EXP, 
                handler: new InfoDeleteDetailExperience(this.telegramServicePod) 
            },
        ].filter(l => l.exchange);

        for (const { exchange, handler } of globalListener.filter(l => l.exchange)) {
            await handler.handle(globalChannel, exchange!);
        }
        for (const { exchange, handler } of SpesifikListeners.filter(l => l.exchange)) {
            await handler.handle(channel, exchange!);
        }
    }
}
