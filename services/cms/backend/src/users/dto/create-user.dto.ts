import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
