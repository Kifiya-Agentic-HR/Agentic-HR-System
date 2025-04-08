import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    validateUser: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user info on valid login', async () => {
      const loginDto: LoginDto = { email: 'user@example.com', password: 'pass123' };
      const mockUser = { _id: '1', email: loginDto.email, role: 'user' };
      const mockResponse = {
        access_token: 'mock_token',
        role: 'user',
        id: '1',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('user@example.com', 'pass123');
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'wrong' };
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('invalid@example.com', 'wrong');
    });
  });
});
