// src/jobs/jobs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<Job>) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = new this.jobModel(dto);
    return job.save();
  }

  async findAll(): Promise<Job[]> {
    return this.jobModel.find().exec();
  }

  async findOne(id: string): Promise<Job> {
    return this.jobModel.findById(id).exec();
  }

  async update(id: string, updateDto: UpdateJobDto): Promise<Job> {
    return this.jobModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Job> {
    return this.jobModel.findByIdAndDelete(id).exec();
  }
}
