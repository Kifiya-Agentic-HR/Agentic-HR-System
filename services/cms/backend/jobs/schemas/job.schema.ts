// src/jobs/schemas/job.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Job extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string; // can be an object/dict if needed

  @Prop({ default: 'Open' })
  job_status: string;

  @Prop({ default: Date.now })
  post_date: Date;

  @Prop([String])
  skills: string[]; // e.g. ["Python", "Docker"]

  // etc. (based on your DB schema)
}

export const JobSchema = SchemaFactory.createForClass(Job);
