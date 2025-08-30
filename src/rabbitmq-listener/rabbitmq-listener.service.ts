import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';

const testConnectionExchange = "test_connection_rabbitmq";
const conectionRabbitmq = "amqp://guest:guest@192.168.199.10:5672";

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