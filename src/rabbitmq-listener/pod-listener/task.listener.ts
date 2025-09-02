import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class SaveFlowEditorAtPod {
    private readonly logger = new Logger(SaveFlowEditorAtPod.name);
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

const summary = tasks.map(t => {
  const pod = t.podData?.[0] || {};
  return `
📥 Flow Editor Applied at pod

📌 Pod Info:
- 🆔 ID: ${pod.id}
- 🔌 MAC: ${pod.mac_address_pod}
- 📡 POD Name: ${pod.pod_name}

📊 Data Summary:
- 📂 Task: ${t.task}
- 🔥 Igniter: ${t.igniter}
- 🕒 Last State: ${t.last_state}
- 🔗 Connection: ${t.connection}
- 🎛️ Node Button: ${t.node_button}
- ⚡ Node Output: ${t.node_output}
  `.trim();
}).join("\n\n");

                if (summary.length > 0) {
                    await this.telegramService.sendMessage(summary);
                } else {
                    this.logger.warn(`⚠️ [${exchange}] Received empty message, skipped sending`);
                }
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

            const messageText = 
`🗑️ Flow Editor Deleted at pod

🧩 Node: ${content.deleteNode?.count ?? 0}
🔘 Node Button: ${content.deleteNode_button?.count ?? 0}
📤 Node Output: ${content.deleteNode_output?.count ?? 0}
🔥 Igniter: ${content.deleteIgniter?.count ?? 0}
📌 Last State: ${content.deleteLastState?.count ?? 0}
🔗 Connections: ${content.deleteconnections?.count ?? 0}
📋 Task: ${content.deleteTask?.count ?? 0}`;

            await this.telegramService.sendMessage(messageText);

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
