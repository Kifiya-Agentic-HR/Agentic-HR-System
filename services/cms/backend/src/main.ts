import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service'; 
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

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
      role: UserRole.ADMIN, // forced
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }
}

bootstrap();
