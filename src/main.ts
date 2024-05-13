import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './config/moduleConfig';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MikroORM } from '@mikro-orm/core';
import fastifyCookie from '@fastify/cookie';


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  //@ts-ignore Wrong type definitions
  await app.register(fastifyCookie);
  const orm = app.get(MikroORM);
  const generator = orm.getSchemaGenerator();
  await generator.dropSchema();
  await generator.createSchema();
  const config = new DocumentBuilder()
    .setTitle('INMSA Challenge')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(8080, "0.0.0.0");
}
bootstrap();
