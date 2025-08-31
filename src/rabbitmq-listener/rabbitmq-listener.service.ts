import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RabbitmqConnectionService } from './rabbitmq.connection';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class RabbitmqListenerService implements OnApplicationBootstrap {
    private readonly logger = new Logger(RabbitmqListenerService.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(
        private readonly rabbitmqService: RabbitmqConnectionService,
        private readonly telegramService: TelegramBotService,
    ) {}

    async onApplicationBootstrap() {
        const channel = await this.rabbitmqService.waitForChannel();

        if (process.env.TEST_CONNECTION_RABBITMQ) {
            await this.listenTestConnection(channel, process.env.TEST_CONNECTION_RABBITMQ);
        }

        if (process.env.CREATE_TASK2_EXCHANGE) {
            await this.listenCreateTask(channel, process.env.CREATE_TASK2_EXCHANGE);
        }

        if (process.env.DELETE_TASK2_EXCHANGE) {
            await this.listenDeleteTask(channel, process.env.DELETE_TASK2_EXCHANGE);
        }
    }

    private async listenTestConnection(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');
        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;

            const content = msg.content.toString();

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`Exchange: [${exchange}]`);
                this.logger.log(`📩 [${exchange}]`);
            });

            channel.ack(msg);
        });
    }

    private async listenCreateTask(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');
        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;

            const content = msg.content.toString();

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`Exchange: [${exchange}]`);
                this.logger.log(`📩 [${exchange}]`);
            });

            channel.ack(msg);
        });
    }

    private async listenDeleteTask(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');
        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;

            const content = msg.content.toString();

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`Exchange: [${exchange}]`);
                this.logger.log(`📩 [${exchange}]`);
            });

            channel.ack(msg);
        });
    }

    private resetTimer(exchange: string, callback: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }

        this.messageTimers[exchange] = setTimeout(async () => {
            await callback();
        }, 5000);
    }
}
