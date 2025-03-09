import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Explicit CORS configuration to allow your frontend at http://localhost:3001
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.init();

  // Bootstrap an admin user if needed
  await bootstrapAdminUser(app.get(UsersService));
  await app.listen(process.env.PORT || 3000);
}

/**
 * Creates an admin user if one doesn't exist, using ADMIN_EMAIL, ADMIN_PASSWORD from .env
 */
async function bootstrapAdminUser(usersService: UsersService) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('No ADMIN_EMAIL or ADMIN_PASSWORD found in environment. Skipping admin bootstrap.');
    return;
  }

  const existingAdmin = await usersService.findByEmail(adminEmail);
  if (!existingAdmin) {
    console.log('No admin found. Creating admin user...');
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
