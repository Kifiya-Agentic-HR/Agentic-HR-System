import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service'; 
import { UserRole } from './users/schemas/user.schema';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { WinstonLoggerService } from './common/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerService(),
  });

  // Add anti-iframe headers globally
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    next();
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Agentic HR System API')
    .setDescription('API documentation for Agentic HR System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI at /api

  await app.init();

  // Attempt to bootstrap an admin user from ENV variables.
  await bootstrapAdminUser(app.get(UsersService));
  await app.listen(process.env.PORT || 3000);
}

/**
 * Creates an admin user if one doesn't exist, using ADMIN_EMAIL, ADMIN_PASSWORD from .env
 */
async function bootstrapAdminUser(usersService: UsersService) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If you haven't provided admin credentials in .env, skip
  if (!adminEmail || !adminPassword) {
    console.log('No ADMIN_EMAIL or ADMIN_PASSWORD found in environment. Skipping admin bootstrap.');
    return;
  }

  // Check if an admin already exists with this email
  const existingAdmin = await usersService.findByEmail(adminEmail);
  if (!existingAdmin) {
    console.log('No admin found. Creating admin user...');
    // We'll create an admin user with the .env credentials
    await usersService.createAdminUser({
      email: adminEmail,
      password: adminPassword,
      role: UserRole.ADMIN,
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }
}

bootstrap();
