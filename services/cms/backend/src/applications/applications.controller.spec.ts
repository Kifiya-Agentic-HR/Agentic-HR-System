import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let appsService: Partial<ApplicationsService>;
  let usersService: Partial<UsersService>;

  const mockApp = { id: '123', name: 'Test App' };
  const mockUser = { firstName: 'John', lastName: 'Doe' };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };
  
  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };
  

  beforeEach(async () => {
    appsService = {
      findAll: jest.fn().mockResolvedValue([mockApp]),
      findOne: jest.fn().mockResolvedValue(mockApp),
      create: jest.fn().mockResolvedValue(mockApp),
      reject: jest.fn().mockResolvedValue({ status: 'rejected' }),
      accept: jest.fn().mockResolvedValue({ status: 'accepted' }),
      update: jest.fn().mockResolvedValue({ ...mockApp, updated: true }),
      editScore: jest.fn().mockResolvedValue({ ...mockApp, score: 85 }),
    };
  
    usersService = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    };
  
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: ApplicationsService, useValue: appsService },
        { provide: UsersService, useValue: usersService },
        { provide: 'AuthGuard', useValue: mockAuthGuard },   
        { provide: 'RolesGuard', useValue: mockRolesGuard }, 
      ],
    })
      .overrideGuard(require('../auth/guards/auth.guard').AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(require('../auth/guards/roles.guard').RolesGuard)
      .useValue(mockRolesGuard)
      .compile();
  
    controller = module.get<ApplicationsController>(ApplicationsController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch all applications', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockApp]);
    expect(appsService.findAll).toHaveBeenCalled();
  });

  it('should fetch one application by ID', async () => {
    const result = await controller.findOne('123');
    expect(result).toEqual(mockApp);
    expect(appsService.findOne).toHaveBeenCalledWith('123');
  });

  it('should create a new application', async () => {
    const file = {} as Express.Multer.File;
    const appData = { name: 'Test' };
    const result = await controller.create(file, appData);
    expect(result).toEqual(mockApp);
    expect(appsService.create).toHaveBeenCalledWith(appData, file);
  });

  it('should reject an application', async () => {
    const result = await controller.reject('123');
    expect(result).toEqual({ status: 'rejected' });
    expect(appsService.reject).toHaveBeenCalledWith('123');
  });

  it('should accept an application', async () => {
    const result = await controller.accept('123');
    expect(result).toEqual({ status: 'accepted' });
    expect(appsService.accept).toHaveBeenCalledWith('123');
  });

  it('should update an application and attach user name', async () => {
    const req = { user: { sub: 'user123' } };
    const updateData = { notes: 'Updated' };
    const result = await controller.update('123', updateData, req);

    expect(usersService.findOne).toHaveBeenCalledWith('user123');
    expect(appsService.update).toHaveBeenCalledWith('123', {
      ...updateData,
      user: 'John Doe',
    });
    expect(result).toEqual({ ...mockApp, updated: true });
  });

  it('should edit score of application', async () => {
    const updateData = { score: 85 };
    const result = await controller.editScore('123', updateData);
    expect(appsService.editScore).toHaveBeenCalledWith('123', updateData);
    expect(result).toEqual({ ...mockApp, score: 85 });
  });
});
