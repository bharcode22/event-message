import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export class DockerEventListener {
    private readonly logger = new Logger(DockerEventListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        await channel.assertExchange(exchange, 'fanout', { durable: true });

        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`Listening for messages on exchange "${exchange}"...`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;

            

            try {
                const content = JSON.parse(msg.content.toString());

function escapeMarkdownV2(text: string): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

function formatContainerMessage(content: any): string {
  let statusEmoji = 'ℹ️';
  let headerEmoji = '🚨';

  switch (content.status) {
    case 'start':
      statusEmoji = '🟢';
      headerEmoji = '✅';
      break;
    case 'stop':
      statusEmoji = '🔴';
      headerEmoji = '❌';
      break;
    case 'die':
      statusEmoji = '⚰️';
      headerEmoji = '❌';
      break;
    case 'destroy':
      statusEmoji = '🗑️';
      headerEmoji = '❌';
      break;
  }

  return `
${headerEmoji} *Docker Container Info* ${headerEmoji}

\`\`\`
${statusEmoji} Status        : ${escapeMarkdownV2(content.status)}
🖥️ POD           : ${escapeMarkdownV2(content.hostname)}
📦 Container     : ${escapeMarkdownV2(content.containerName)}
🐳 Image         : ${escapeMarkdownV2(content.image)}

🌐 Server IP     : ${escapeMarkdownV2(content.serverIp)}
⏱️ Time          : ${escapeMarkdownV2(new Date(content.time * 1000).toLocaleString())}
\`\`\`
  `.trim();
}


const messageText = formatContainerMessage(content);
await this.telegramService.sendMessage(messageText);

                this.logger.log(`Message forwarded to Telegram: ${content.containerName}`);

                channel.ack(msg);
            } catch (err) {
                this.logger.error('Failed to process message:', err);
                channel.nack(msg, false, false);
            }
        });
    }

    private resetTimer(exchange: string, cb: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }
        this.messageTimers[exchange] = setTimeout(cb, 5000);
    }
}

export class DockerReady {
    private readonly logger = new Logger(DockerReady.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        await channel.assertExchange(exchange, 'fanout', { durable: true });

        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`Listening for messages on exchange "${exchange}"...`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;

            

            try {
                const content = JSON.parse(msg.content.toString());

// function escapeMarkdownV2(text: string): string {
//     return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
// }

// function formatContainerMessage(content: any): string {
//   let statusEmoji = 'ℹ️';
//   let headerEmoji = '🚨';

//   switch (content.status) {
//     case 'start':
//       statusEmoji = '🟢';
//       headerEmoji = '✅';
//       break;
//     case 'stop':
//       statusEmoji = '🔴';
//       headerEmoji = '❌';
//       break;
//     case 'die':
//       statusEmoji = '⚰️';
//       headerEmoji = '❌';
//       break;
//     case 'destroy':
//       statusEmoji = '🗑️';
//       headerEmoji = '❌';
//       break;
//   }

//   return `
// ${headerEmoji} *Docker Container Info* ${headerEmoji}

// \`\`\`
// ${statusEmoji} Status        : ${escapeMarkdownV2(content.status)}
// 🖥️ POD           : ${escapeMarkdownV2(content.hostname)}
// 📦 Container     : ${escapeMarkdownV2(content.containerName)}
// 🐳 Image         : ${escapeMarkdownV2(content.image)}

// 🌐 Server IP     : ${escapeMarkdownV2(content.serverIp)}
// ⏱️ Time          : ${escapeMarkdownV2(new Date(content.time * 1000).toLocaleString())}
// \`\`\`
//   `.trim();
// }


// const messageText = formatContainerMessage(content);
// await this.telegramService.sendMessage(messageText);

                // this.logger.log(`Message forwarded to Telegram: ${content.containerName}`);

                console.log(content);

                channel.ack(msg);
            } catch (err) {
                this.logger.error('Failed to process message:', err);
                channel.nack(msg, false, false);
            }
        });
    }

    private resetTimer(exchange: string, cb: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }
        this.messageTimers[exchange] = setTimeout(cb, 5000);
    }
}
