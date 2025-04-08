import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserRole } from './schemas/user.schema';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUserModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: typeof mockUserModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAdminUser', () => {
    it('should create an admin user with hashed password', async () => {
      const dto = { email: 'admin@example.com', password: 'pass123', role: UserRole.HM }; // dummy role
      const hashed = 'hashed';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);
      const saveMock = jest.fn().mockResolvedValue({ ...dto, password: hashed, role: UserRole.ADMIN });

      const mockConstructor = jest.fn().mockReturnValue({ save: saveMock });
      (service as any).userModel = mockConstructor;

      const result = await service.createAdminUser(dto);

      expect(result).toEqual({ ...dto, password: hashed, role: UserRole.ADMIN });
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('createHRUser', () => {
    it('should create an HR user', async () => {
      const dto = { email: 'hr@example.com', password: 'pass123', role: UserRole.HM }; // dummy role
      const hashed = 'hashedHR';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);
      const saveMock = jest.fn().mockResolvedValue({ ...dto, password: hashed, role: UserRole.HR });

      const mockConstructor = jest.fn().mockReturnValue({ save: saveMock });
      (service as any).userModel = mockConstructor;

      const result = await service.createHRUser(dto);
      expect(result).toEqual({ ...dto, password: hashed, role: UserRole.HR });
    });
  });

  describe('createHMUser', () => {
    it('should create an HM user', async () => {
      const dto = { email: 'hm@example.com', password: 'pass123', role: UserRole.HR }; // dummy role
      const hashed = 'hashedHM';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);
      const saveMock = jest.fn().mockResolvedValue({ ...dto, password: hashed, role: UserRole.HM });

      const mockConstructor = jest.fn().mockReturnValue({ save: saveMock });
      (service as any).userModel = mockConstructor;

      const result = await service.createHMUser(dto);
      expect(result).toEqual({ ...dto, password: hashed, role: UserRole.HM });
    });
  });

  describe('findByEmail', () => {
    it('should return user if found by email', async () => {
      const user = { email: 'test@example.com' };
      model.findOne.mockReturnValue({ exec: () => Promise.resolve(user) });

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ email: 'a@a.com' }, { email: 'b@b.com' }];
      model.find.mockReturnValue({ exec: () => Promise.resolve(users) });

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return user by ID', async () => {
      const user = { _id: '123' };
      model.findById.mockReturnValue({ exec: () => Promise.resolve(user) });

      const result = await service.findOne('123');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      model.findById.mockReturnValue({ exec: () => null });

      await expect(service.findOne('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserByAdmin', () => {
    it('should update user with hashed password if provided', async () => {
      const dto = { password: 'newpass' };
      const hashed = 'newhashed';
      const updatedUser = { _id: '1', password: hashed };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);
      model.findByIdAndUpdate.mockReturnValue({ exec: () => Promise.resolve(updatedUser) });

      const result = await service.updateUserByAdmin('1', dto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      model.findByIdAndUpdate.mockReturnValue({ exec: () => null });

      await expect(service.updateUserByAdmin('badid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOwnAccount', () => {
    it('should update allowed fields only', async () => {
      const dto = {
        firstName: 'New',
        lastName: 'Name',
        password: 'newpass',
      };
      const hashed = 'hashedpass';
      const updatedUser = { firstName: 'New', lastName: 'Name', password: hashed };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);
      model.findByIdAndUpdate.mockReturnValue({ exec: () => Promise.resolve(updatedUser) });

      const result = await service.updateOwnAccount('id123', dto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      model.findByIdAndUpdate.mockReturnValue({ exec: () => null });

      await expect(service.updateOwnAccount('id123', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserByAdmin', () => {
    it('should delete HR or HM user', async () => {
      const user = { _id: '123', role: UserRole.HR };
      model.findById.mockReturnValue({ exec: () => Promise.resolve(user) });
      model.findByIdAndDelete.mockReturnValue({ exec: () => Promise.resolve(true) });

      const result = await service.deleteUserByAdmin('123');
      expect(result).toEqual({ deleted: true });
    });

    it('should throw UnauthorizedException for deleting admin', async () => {
      const adminUser = { _id: '1', role: UserRole.ADMIN };
      model.findById.mockReturnValue({ exec: () => Promise.resolve(adminUser) });

      await expect(service.deleteUserByAdmin('1')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      model.findById.mockReturnValue({ exec: () => null });

      await expect(service.deleteUserByAdmin('fake-id')).rejects.toThrow(NotFoundException);
    });
  });
});
