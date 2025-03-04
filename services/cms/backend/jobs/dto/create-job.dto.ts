import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];
}
