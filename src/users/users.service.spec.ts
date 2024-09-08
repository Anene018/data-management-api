// users.service.spec.ts
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schema/user.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<UserDocument>;

  // Mock user data
  let mockUser: UserDocument;
  let mockUser2: UserDocument;

  // Mock implementation of the UserModel with Jest functions
  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    // Define mock users
    mockUser = {
      name: 'Emma',
      userId: 1,
      email: 'emma@gmail.com',
    } as UserDocument;

    mockUser2 = {
      name: 'Emma2',
      userId: 2,
      email: 'emma2@gmail.com',
    } as UserDocument;

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    // Get the service from the testing module
    usersService = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return all users from the database', async () => {
      mockUserModel.find.mockResolvedValue([mockUser, mockUser2]);

      const users = await usersService.findAllUsers();
      expect(userModel.find).toHaveBeenCalled();
      expect(users).toEqual([mockUser, mockUser2]);
    });

    it('should throw NotFoundException if there are no users in the database', async () => {
      mockUserModel.find.mockResolvedValue(null);

      await expect(usersService.findAllUsers()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUser', () => {
    it('should get a user by userId', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser2);

      const user = await usersService.getuser(2);
      expect(userModel.findOne).toHaveBeenCalledWith({ userId: 2 });
      expect(user).toEqual(mockUser2);
    });

    it('should throw NotFoundException if user with userId does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(usersService.getuser(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('editUser', () => {
    it('should edit a user and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser2, ...updateUserDto };
      mockUserModel.findOneAndUpdate.mockResolvedValue(updatedUser);

      const result = await usersService.editUser(2, updateUserDto);
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 2 },
        { $set: updateUserDto },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user with userId is not found', async () => {
      mockUserModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        usersService.editUser(2, { name: 'Not found' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should find user by userId and delete the user', async () => {
      mockUserModel.findOneAndDelete.mockResolvedValue(mockUser);

      const deletedUser = await usersService.deleteUser(1);
      expect(userModel.findOneAndDelete).toHaveBeenCalledWith({ userId: 1 });
      expect(deletedUser).toEqual(mockUser);
    });

    it('should return null if user with userId does not exist for deletion', async () => {
      mockUserModel.findOneAndDelete.mockResolvedValue(null);

      const result = await usersService.deleteUser(1);
      expect(result).toBeNull();
    });
  });
});
