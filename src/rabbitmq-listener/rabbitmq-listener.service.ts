import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import * as dotenv from 'dotenv';
dotenv.config();

const conectionRabbitmq = `${process.env.RABBITMQ_URL}`;
const testConnectionExchange = `${process.env.TEST_CONNECTION_RABBITMQ}`;

@Injectable()
export class RabbitmqListenerService implements OnModuleInit {
    constructor(
        private readonly telegramBot: TelegramBotService
    ) {}

    async onModuleInit() {
        try {
            const connection = await amqp.connect(conectionRabbitmq);
            const channel = await connection.createChannel();
            await channel.assertExchange(testConnectionExchange, "fanout", { durable: true });
            const { queue } = await channel.assertQueue("", { exclusive: true });
            await channel.bindQueue(queue, testConnectionExchange, "");
            channel.prefetch(1);

            console.log(`\x1b[32mQueue: ${testConnectionExchange} ${queue}\x1b[0m`);

            channel.consume(
                queue,
                async (msg) => {
                    if (!msg) return;
                    try {
                        const data = JSON.parse(msg.content.toString());
                        console.log(data);

                        await this.telegramBot.sendMessage(`📢 Event baru: ${JSON.stringify(data)}`);

                        channel.ack(msg);
                    } catch (err) {
                        console.error("\x1b[31m❌ Error processing message:", err, "\x1b[0m");
                        channel.nack(msg, false, false);
                    }
                },
                { noAck: false }
            );
        } catch (err) {
            console.error('❌ Error during RabbitMQ connection:', err);
        }
    }
}