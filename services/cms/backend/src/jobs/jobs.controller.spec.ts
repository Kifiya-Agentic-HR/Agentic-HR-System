import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

const mockJobsService = {
  findAll: jest.fn().mockResolvedValue(['job1', 'job2']),
  findOne: jest.fn().mockResolvedValue('job1'),
  findApplicationsByJob: jest.fn().mockResolvedValue(['application1']),
  create: jest.fn().mockResolvedValue('newJob'),
  update: jest.fn().mockResolvedValue('updatedJob'),
  remove: jest.fn().mockResolvedValue('deletedJob'),
};

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

const mockRolesGuard = {
  canActivate: jest.fn(() => true),
};

describe('JobsController', () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        { provide: JobsService, useValue: mockJobsService },
      ],
    })
      .overrideGuard(require('../auth/guards/auth.guard').AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(require('../auth/guards/roles.guard').RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all jobs', async () => {
    const result = await controller.findAll();
    expect(result).toEqual(['job1', 'job2']);
  });

  it('should return one job', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual('job1');
  });

  it('should return applications for a job', async () => {
    const result = await controller.findApplicationsByJob('1');
    expect(result).toEqual(['application1']);
  });

  it('should create a job with user id', async () => {
    const mockReq = { user: { sub: 'user123' } };
    const jobData = { title: 'Test Job' };
    const result = await controller.create(jobData, mockReq);
    expect(result).toEqual('newJob');
  });

  it('should return error if no user id is found in request', async () => {
    const result = await controller.create({ title: 'No ID Job' }, {});
    expect(result).toEqual({ success: false, error: 'No id found in the token' });
  });

  it('should update a job', async () => {
    const result = await controller.update('1', { title: 'Updated' });
    expect(result).toEqual('updatedJob');
  });

  it('should delete a job', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual('deletedJob');
  });
});
