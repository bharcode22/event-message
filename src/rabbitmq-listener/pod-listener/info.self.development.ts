import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class InfoCreateSelfDev {
    private readonly logger = new Logger(InfoCreateSelfDev.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Create Self Dev Data*\n` + // Judul pesan
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

export class InfoUpdateSelfDev {
    private readonly logger = new Logger(InfoUpdateSelfDev.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Update Self Dev Data*\n` + 
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

export class InfoDeleteSelfDev {
    private readonly logger = new Logger(InfoDeleteSelfDev.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Delete Self Dev Data*\n` + 
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

export class InfoCreateSelfDevSound {
    private readonly logger = new Logger(InfoCreateSelfDevSound.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Create Self Dev Sound Data*\n` + 
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

export class InfoUpdateSelfDevSound {
    private readonly logger = new Logger(InfoCreateSelfDevSound.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Update Self Dev Sound Data*\n` + 
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

export class InfoDeleteSelfDevSound {
    private readonly logger = new Logger(InfoCreateSelfDevSound.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Delete Self Dev Sound Data*\n` + 
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
