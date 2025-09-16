import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class InfoAppCrash {
    private readonly logger = new Logger(InfoAppCrash.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 APP CRASH\n` + 
                    "```json\n" +
                    JSON.stringify(content, null, 2) +
                    "\n```";

                await this.telegramService.sendMessage(jsonMessage);
            } catch (err) {
                this.logger.error(
                    `Failed to format & send Telegram message: ${err.message}`,
                );
            }

            channel.ack(msg);
        });
    }
}