import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'HR',
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash('plainPassword', 10),
      });

      const result = await authService.validateUser('test@example.com', 'plainPassword');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(expect.objectContaining({ _id: 'user123' }));
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.validateUser('unknown@example.com', 'password'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash('differentPassword', 10),
      });

      await expect(authService.validateUser('test@example.com', 'wrongPassword'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token and user info', async () => {
      const result = await authService.login(mockUser as any);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user123', role: 'HR' });
      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        role: 'HR',
        id: 'user123',
      });
    });
  });

  describe('hashPassword', () => {
    it('should return a hashed password', async () => {
      const hashed = await authService.hashPassword('myPassword');
      const isMatch = await bcrypt.compare('myPassword', hashed);

      expect(typeof hashed).toBe('string');
      expect(isMatch).toBe(true);
    });
  });
});
