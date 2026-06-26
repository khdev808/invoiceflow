import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  const isProd = process.env.NODE_ENV === 'production';
  const adminUrl = process.env.ADMIN_APP_URL?.replace(/\/$/, '');
  const corsOrigins = isProd
    ? [adminUrl].filter((o): o is string => Boolean(o))
    : ['http://localhost:3000', 'http://127.0.0.1:3000', adminUrl].filter((o): o is string => Boolean(o));

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Legacy local uploads (dev only); production stores logos as data URLs in the database
  if (!isProd) {
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  }

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('InvoiceFlow API')
      .setDescription('Professional invoicing platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`InvoiceFlow API running on http://localhost:${port}`);
  if (!isProd) console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
