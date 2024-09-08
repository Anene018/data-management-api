import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Model } from 'mongoose';
import { beforeEach, describe, it } from 'node:test';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UserDocument, User } from 'src/users/schema/user.schema';

describe('Authservice', () => {
  let authServive: AuthService;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;

  let mockUser: UserDocument;

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
  };

  beforeEach(async () => {
    mockUser = {
      name: 'emma',
      userId: 1,
      email: 'emma@gmail.com',
      password: await argon.hash('123456'),
    } as UserDocument;

    mockUserModel.create.mockResolvedValue(mockUser);
    mockUserModel.findOne.mockResolvedValue(mockUser);

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

    authServive = module.get<AuthService>(AuthService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('check if authService is injected', () => {
    expect(authServive).toBeDefined();
  });

  describe('user registration', () => {
    it('should register a new user and return a token', async () => {
      const userDto = {
        email: 'emma@gmail.com',
        password: '123456',
        userId: 1,
        name: 'emma',
      };
      const result = await authServive.register(userDto);
      expect(result).toEqual({ access_token: 'test-token' });
    });

    it('should throw an error if user already exists', async () => {
      mockUserModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        authServive.register({
          email: 'emma@gmail.com',
          password: '123456',
          userId: 1,
          name: 'emma',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login user', () => {
    it('login an existing user', async () => {
      const loginDto = { email: 'emma@gmail.com', password: '123456' };
      jest.spyOn(argon, 'verify').mockResolvedValue(true);

      const result = await authServive.login(loginDto);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(result).toEqual({ access_token: 'test-token' });
    });

    it('should throw an error if user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authServive.login({
          email: 'wrongemail@gmail.com',
          password: '123456',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error for wrong password', async () => {
      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      await expect(
        authServive.login({
          email: 'emma@gmail.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    describe('signToken', () => {
      it('generates a JWT token for the user', async () => {
        const userId = 1;
        const email = 'emma@gmail.com';

        const result = await authServive.signToken(userId, email);

        expect(jwtService.signAsync).toHaveBeenCalledWith(
          {
            sub: userId,
            email,
          },
          { expiresIn: '60m', secret: process.env.JWT_SECRET },
        );

        expect(result).toEqual({ access_token: 'test-token' });
      });
    });
  });
});
