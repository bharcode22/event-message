import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

export class MinioUploadMusicEventListener {
    private readonly logger = new Logger(MinioUploadMusicEventListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServiceAdmin) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = msg.content.toString();
            const parsed = JSON.parse(content);

            this.resetTimer(exchange, async () => {
                const record = parsed?.Records?.[0];
                if (!record) return;

                const bucket = record.s3?.bucket?.name;
                const sizeMB = ((record.s3?.object?.size || 0) / (1024 * 1024)).toFixed(2);
                const uploader = record.userIdentity?.principalId;
                const eventTime = record.eventTime;

                const key = parsed.Key || parsed.Records?.[0]?.s3?.object?.key;
                const fileName = decodeURIComponent(key.split('/').pop() || "");
                const title = fileName.replace(/\.[^/.]+$/, "");
                const contentType = record.s3?.object?.contentType || "unknown";

                let audioMessage: string | undefined;
                if (contentType === 'audio/mpeg' || contentType === 'audio/wav') {
                    audioMessage = `deteacing duration, please wait...`;
                } else {
                    audioMessage = `not an audio file. skip duration detection.`;
                }

const message = `
Minio Upload Event Detected!

📂 File: ${title}

📏 Size: ${sizeMB} MB

👤 Uploaded By: ${uploader}

🕒 Event Time: ${eventTime}

Type: ${contentType}

🕒 ${audioMessage}
`;

                await this.telegramService.sendMessage(message);
                this.logger.log(`📩 [${exchange}] Event forwarded to Telegram`);
            });

            channel.ack(msg);
        });
    }

    private resetTimer(exchange: string, cb: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }
        this.messageTimers[exchange] = setTimeout(cb, 5000);
    }
}

export class DetectSongDuration {
    private readonly logger = new Logger(DetectSongDuration.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServiceAdmin) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            this.logger.log(`[${exchange}] Message received: ${msg.content.toString()}`);
            
            const content = msg.content.toString();
            const parsed = JSON.parse(content);

            this.resetTimer(exchange, async () => {
                this.logger.log(`[${exchange}] Timer executed`);

                const fileName = parsed.tittle.split('/').pop() || parsed.tittle;

const message = `
🎵 Duration Detected

- 🎶 Title: ${fileName}

- ⏱️ Duration: ${parsed.duration}

- 📅 Detected At: ${new Date(parsed.creaetdAt).toLocaleString("id-ID")}
`;

                await this.telegramService.sendMessage(message);
            });

            channel.ack(msg);
        });

    }

    private resetTimer(exchange: string, cb: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }
        this.messageTimers[exchange] = setTimeout(cb, 5000);
    }
}
