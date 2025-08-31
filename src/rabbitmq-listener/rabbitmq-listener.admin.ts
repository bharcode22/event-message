import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RabbitmqConnectionService } from './rabbitmq.connection';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class RabbitmqListenerAdmin implements OnApplicationBootstrap {
    private readonly logger = new Logger(RabbitmqListenerAdmin.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(
        private readonly rabbitmqService: RabbitmqConnectionService,
        private readonly telegramService: TelegramBotService,
    ) {}

    async onApplicationBootstrap() {
        const channel = await this.rabbitmqService.waitForChannel();

        if (process.env.ADMIN_INFORMATION_EXCHANGE) {
        await channel.assertExchange(process.env.ADMIN_INFORMATION_EXCHANGE, 'fanout', { durable: true });
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, process.env.ADMIN_INFORMATION_EXCHANGE, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            try {
                const content = msg.content.toString();
                const parsed = JSON.parse(content);
                const admin = parsed.admin;
                const detail = parsed.detail;

                const message = `
                    👤 *Admin*
                    - ID: \`${admin.id}\`
                    - Username: ${admin.username}
                    - Full Name: ${admin.full_names}
                    - Email: ${admin.email}

                    📝 *Detail*
                    - Action: ${detail.action}
                    - Table: ${detail.model}
                    - User ID: \`${detail.userId}\`
                    - Created At: ${detail.createdAt}
                `.trim();

                await this.telegramService.sendMessage(message);
                // channel.ack(msg);

            } catch (err) {
                this.logger.error(`❌ Failed to process admin info: ${err.message}`);
                channel.nack(msg, false, false);
            }
        });

        this.logger.log(`✅ Listening separately on admin exchange: ${process.env.ADMIN_INFORMATION_EXCHANGE}`);
        }
    }
}
