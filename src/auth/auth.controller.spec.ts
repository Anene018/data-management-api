import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, UserDto } from './dto';
import { ConflictException, ForbiddenException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('User registration', () => {
    it('should return a token when a new user is registered', async () => {
      const userDto: UserDto = {
        email: 'emma@gmail.com',
        password: '123456',
        userId: 1,
        name: 'emma',
      };

      const token = { access_token: 'test-token' };
      mockAuthService.register.mockResolvedValue(token);

      expect(await authController.register(userDto)).toEqual(token);
    });

    it('should throw an error if user with email already exists ', async () => {
      const userDto: UserDto = {
        email: 'emma@gmail.com',
        password: '123456',
        userId: 1,
        name: 'emma',
      };
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with email already exists '),
      );

      await expect(authController.register(userDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Login', () => {
    it('should return a token is user logins successfully', async () => {
      const loginDto: LoginDto = {
        email: 'emma@gmail.com',
        password: '123456',
      };

      const token = { access_token: 'test-token' };

      mockAuthService.login.mockResolvedValue(token);

      expect(await authController.login(loginDto)).toEqual(token);
    });

    it('it should throw an error if credentials are incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'emma@gmail.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new ForbiddenException('Credentials are incorrect'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
