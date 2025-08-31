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

        const exchanges = [
            process.env.TEST_CONNECTION_RABBITMQ,
            process.env.CREATE_TASK2_EXCHANGE,
            process.env.DELETE_TASK2_EXCHANGE,
        ].filter(Boolean);

        for (const exchange of exchanges) {
            const q = await channel.assertQueue('', { exclusive: true });
            await channel.bindQueue(q.queue, exchange, '');

            this.logger.log(`✅ Listening on exchange: ${exchange}`);

            await channel.consume(q.queue, async (msg: any) => {
                if (msg) {
                const content = msg.content.toString();
                // this.logger.log(`📩 [${exchange}] ${content}`);
                this.logger.log(`📩 [${exchange}]`);

                if (exchange) {
                    if (this.messageTimers[exchange]) {
                        clearTimeout(this.messageTimers[exchange]);
                    }

                    this.messageTimers[exchange] = setTimeout(async () => {
                        await this.telegramService.sendMessage(`📩 [${exchange}]`);
                    }, 5000);
                }

                channel.ack(msg);
                }
            });
        }
    }
}
