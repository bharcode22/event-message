import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    await app.startAllMicroservices().then(() => {
        console.log('Successfully connected to RabbitMQ and listening to events');
    });

    await app.listen(3000);
}
bootstrap();
