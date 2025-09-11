import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class InfoCreateExperience {
    private readonly logger = new Logger(InfoCreateExperience.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Create Experience Data*\n` + 
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

export class InfoUpdateExperience {
    private readonly logger = new Logger(InfoCreateExperience.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Update Experience Data*\n` + 
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

export class InfoDeleteExperience {
    private readonly logger = new Logger(InfoCreateExperience.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Delete Experience Data*\n` + 
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

export class InfoCreateDetailExperience {
    private readonly logger = new Logger(InfoCreateDetailExperience.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Create Detail Experience Data*\n` + 
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

export class InfoUpdateDetailExperience {
    private readonly logger = new Logger(InfoUpdateDetailExperience.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Update Detail Experience Data*\n` + 
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

export class InfoDeleteDetailExperience {
    private readonly logger = new Logger(InfoDeleteDetailExperience.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const jsonMessage =
                    `📌 *Delete Detail Experience Data*\n` + 
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
