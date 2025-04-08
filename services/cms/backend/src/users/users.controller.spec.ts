import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

class MockRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

// 🧪 Mock UsersService
const mockUserService = {
  createHRUser: jest.fn(),
  createHMUser: jest.fn(),
  findAll: jest.fn(),
  updateUserByAdmin: jest.fn(),
  findOne: jest.fn(),
  updateOwnAccount: jest.fn(),
  deleteUserByAdmin: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(MockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createHR', () => {
    it('should call service to create HR user', async () => {
      const dto: CreateUserDto = { email: 'hr@test.com', password: '123', role: UserRole.HM };
      const created = { ...dto, role: UserRole.HR };

      mockUserService.createHRUser.mockResolvedValue(created);
      const result = await controller.createHR(dto);
      expect(result).toEqual(created);
      expect(service.createHRUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('createHM', () => {
    it('should call service to create HM user', async () => {
      const dto: CreateUserDto = { email: 'hm@test.com', password: '123', role: UserRole.HR };
      const created = { ...dto, role: UserRole.HM };

      mockUserService.createHMUser.mockResolvedValue(created);
      const result = await controller.createHM(dto);
      expect(result).toEqual(created);
      expect(service.createHMUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ email: 'a@a.com' }, { email: 'b@b.com' }];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('updateAnyUser', () => {
    it('should update user by ID', async () => {
      const id = '123';
      const dto: UpdateUserDto = { password: 'newpass' };
      const updated = { _id: id, ...dto };

      mockUserService.updateUserByAdmin.mockResolvedValue(updated);
      const result = await controller.updateAnyUser(id, dto);
      expect(result).toEqual(updated);
      expect(service.updateUserByAdmin).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('getMe', () => {
    it('should return user profile from req.user.sub', async () => {
      const req = { user: { sub: 'userid123' } };
      const user = { _id: 'userid123', email: 'me@test.com' };

      mockUserService.findOne.mockResolvedValue(user);
      const result = await controller.getMe(req);
      expect(result).toEqual(user);
      expect(service.findOne).toHaveBeenCalledWith('userid123');
    });
  });

  describe('me (name)', () => {
    it('should return full name of current user', async () => {
      const req = { user: { sub: 'userid123' } };
      const user = { firstName: 'Sam', lastName: 'Rawit' };
  
      mockUserService.findOne.mockResolvedValue(user);
      const result = await controller.me(req);
      expect(result).toEqual({ name: 'Sam Rawit' });
      expect(service.findOne).toHaveBeenCalledWith('userid123');
    });
  
    it('should return fallback message if user not found', async () => {
      const req = {}; 
      const result = await controller.me(req);
      expect(result).toEqual({ name: 'Guest' });
    });
  });


  describe('updateMe', () => {
    it('should update own account', async () => {
      const req = { user: { sub: 'userid456' } };
      const dto: UpdateUserDto = { firstName: 'Updated' };
      const updated = { ...dto, _id: 'userid456' };

      mockUserService.updateOwnAccount.mockResolvedValue(updated);
      const result = await controller.updateMe(req, dto);
      expect(result).toEqual(updated);
      expect(service.updateOwnAccount).toHaveBeenCalledWith('userid456', dto);
    });
  });

  describe('removeUser', () => {
    it('should delete user by ID', async () => {
      const id = 'deleteId';
      const response = { deleted: true };

      mockUserService.deleteUserByAdmin.mockResolvedValue(response);
      const result = await controller.removeUser(id);
      expect(result).toEqual(response);
      expect(service.deleteUserByAdmin).toHaveBeenCalledWith(id);
    });
  });
});
