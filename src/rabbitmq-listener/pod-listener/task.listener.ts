import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class CreateTaskListenerPod {
    private readonly logger = new Logger(CreateTaskListenerPod.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};
    private messageBuffer: Record<string, any[]> = {};

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            if (!this.messageBuffer[exchange]) {
                this.messageBuffer[exchange] = [];
            }
            this.messageBuffer[exchange].push(content);

            this.resetTimer(exchange, async () => {
                const tasks = this.messageBuffer[exchange];
                this.messageBuffer[exchange] = [];

const summary = tasks
  .map(task => {
    if (typeof task.isReloaded !== "undefined") {
      return `
🔄 Reload Schedule
=========================
⚡ Status: ${task.isReloaded ? "Reloaded ✅" : "Failed ❌"}
      `.trim();
    }

    return `
📩 Unknown Message
=========================
${JSON.stringify(task, null, 2)}
    `.trim();
  })
  .join("\n\n");

await this.telegramService.sendMessage(summary);
this.logger.log(`🗑️ [${exchange}] ${JSON.stringify(content)}`);

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

export class DeleteTaskAtPodListener {
    private readonly logger = new Logger(DeleteTaskAtPodListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            this.resetTimer(exchange, async () => {
                const pod = content.podData;
                const data = content.data;

const message = `
🗑️ Delete Flow Editor at Pod
=========================
📌 Message: ${content.message}

🔹 Pod Info:
• IP: ${pod.ip_address}
• pod_id: ${pod.id}
• pod_name: ${pod.name}
• mac_address_pod: ${pod.mac_address_pod}

🔹 Data deleted:
• Task Data: ${data.task_data}
• Last State: ${data.last_state_data}
• Igniters: ${data.igniterData}
`;

                await this.telegramService.sendMessage(message.trim());
                this.logger.log(`🗑️ [${exchange}] ${JSON.stringify(content)}`);
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
