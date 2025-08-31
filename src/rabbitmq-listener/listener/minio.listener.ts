import { Logger } from '@nestjs/common';
import { TelegramBotService } from '../../telegram-bot/telegram-bot.service';

export class MinioUploadMusicEventListener {
    private readonly logger = new Logger(MinioUploadMusicEventListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotService) {}

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
                const objectKey = decodeURIComponent(record.s3?.object?.key || '');
                const sizeMB = ((record.s3?.object?.size || 0) / (1024 * 1024)).toFixed(2);
                const uploader = record.userIdentity?.principalId;
                const eventTime = record.eventTime;

                const message = `
📂 *Bucket*: \`${bucket}\`
🎶 *File*: ${objectKey}
📏 *Size*: ${sizeMB} MB
👤 *Uploaded By*: ${uploader}
🕒 *Event Time*: ${eventTime}
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
