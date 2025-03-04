// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
}

@Schema()
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.HR,
  })
  role: UserRole;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
