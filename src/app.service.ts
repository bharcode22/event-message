import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello From RabbitMQ Telegram Bot Service!';
  }
}
