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

function escapeMarkdownV2(text: string): string {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const summary = tasks.map(t => {
  const pod = t.podData?.[0] || {};

  return `
📥 *Flow Editor Applied at Pod*

📌 *Pod Info:*
\`\`\`
🆔  ID       : ${escapeMarkdownV2(pod.id)}
🔌  MAC      : ${escapeMarkdownV2(pod.mac_address_pod)}
📡  POD Name : ${escapeMarkdownV2(pod.pod_name)}
\`\`\`

📊 *Data Summary:*
\`\`\`
📂  Task         : ${escapeMarkdownV2(t.task)}
🔥  Igniter      : ${escapeMarkdownV2(t.igniter)}
🕒  Last State   : ${escapeMarkdownV2(t.last_state)}
🔗  Connection   : ${escapeMarkdownV2(t.connection)}
🎛️  Node Button  : ${escapeMarkdownV2(t.node_button)}
⚡  Node Output  : ${escapeMarkdownV2(t.node_output)}
\`\`\`
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

function escapeMarkdownV2(text: string): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const messageText = `
🗑️ *Flow Editor Deleted at Pod*

\`\`\`
🧩  Node           : ${escapeMarkdownV2(content.deleteNode?.count ?? 0)}
🔘  Node Button    : ${escapeMarkdownV2(content.deleteNode_button?.count ?? 0)}
📤  Node Output    : ${escapeMarkdownV2(content.deleteNode_output?.count ?? 0)}
🔥  Igniter        : ${escapeMarkdownV2(content.deleteIgniter?.count ?? 0)}
📌  Last State     : ${escapeMarkdownV2(content.deleteLastState?.count ?? 0)}
🔗  Connections    : ${escapeMarkdownV2(content.deleteconnections?.count ?? 0)}
📋  Task           : ${escapeMarkdownV2(content.deleteTask?.count ?? 0)}
\`\`\`
`.trim();

await this.telegramService.sendMessage(messageText, { parse_mode: 'MarkdownV2' });

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
