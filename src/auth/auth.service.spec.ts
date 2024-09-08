// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Model } from 'mongoose';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UserDocument, User } from 'src/users/schema/user.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;

  let mockUser: UserDocument;

  // Mock UserModel with Jest functions
  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  // Mock JwtService
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
  };

  beforeEach(async () => {
    // Define a mock user
    mockUser = {
      name: 'emma',
      userId: 1,
      email: 'emma@gmail.com',
      password: await argon.hash('123456'),
    } as UserDocument;

    // Set up the testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    // Get the service and other dependencies
    authService = module.get<AuthService>(AuthService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const userDto = {
        email: 'emma@gmail.com',
        password: '123456',
        userId: 1,
        name: 'emma',
      };

      mockUserModel.create.mockResolvedValue(mockUser);
      const result = await authService.register(userDto);
      expect(result).toEqual({ access_token: 'test-token' });
      expect(mockUserModel.create).toHaveBeenCalledWith(userDto);
    });

    it('should throw a ConflictException if user already exists', async () => {
      mockUserModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        authService.register({
          email: 'emma@gmail.com',
          password: '123456',
          userId: 1,
          name: 'emma',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login an existing user and return a token', async () => {
      const loginDto = { email: 'emma@gmail.com', password: '123456' };
      jest.spyOn(argon, 'verify').mockResolvedValue(true);

      mockUserModel.findOne.mockResolvedValue(mockUser);
      const result = await authService.login(loginDto);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(result).toEqual({ access_token: 'test-token' });
    });

    it('should throw a ForbiddenException if user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrongemail@gmail.com',
          password: '123456',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw a ForbiddenException for wrong password', async () => {
      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'emma@gmail.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('signToken', () => {
    it('should generate a JWT token for the user', async () => {
      const userId = 1;
      const email = 'emma@gmail.com';

      const result = await authService.signToken(userId, email);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email },
        { expiresIn: '60m', secret: process.env.JWT_SECRET },
      );

      expect(result).toEqual({ access_token: 'test-token' });
    });
  });
});
