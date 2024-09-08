// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schema/user.schema'; // Correct import path for UserDocument

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  // Mock user data
  let mockUser: UserDocument;
  let mockUser2: UserDocument;

  // Mock UsersService implementation
  const mockUsersService = {
    findAllUsers: jest.fn(),
    getuser: jest.fn(),
    editUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    // Define mock users
    mockUser = {
      name: 'Emma',
      userId: 1,
      email: 'emma@gmail.com',
      password: 'hashedpassword',
    } as UserDocument;

    mockUser2 = {
      name: 'Emma2',
      userId: 2,
      email: 'emma2@gmail.com',
      password: 'hashedpassword2',
    } as UserDocument;

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    // Get the controller and service from the testing module
    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('Get all users', () => {
    it('should return all users in the database', async () => {
      mockUsersService.findAllUsers.mockResolvedValue([mockUser, mockUser2]);

      expect(await usersController.findAllUsers()).toEqual([
        mockUser,
        mockUser2,
      ]);
    });

    it('should throw NotFoundException if there are no users in the database', async () => {
      // Mock rejection with NotFoundException instead of resolving with null
      mockUsersService.findAllUsers.mockRejectedValue(
        new NotFoundException('No users available'),
      );

      await expect(usersController.findAllUsers()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Get user by userId', () => {
    it('should return a user by their userId', async () => {
      mockUsersService.getuser.mockResolvedValue(mockUser);

      expect(await usersController.getUser('1')).toEqual(mockUser);
      expect(mockUsersService.getuser).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      // Mock rejection with NotFoundException instead of resolving with null
      mockUsersService.getuser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(usersController.getUser('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Edit user', () => {
    it('should edit a user and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUsersService.editUser.mockResolvedValue(updatedUser);

      expect(await usersController.editUser('1', updateUserDto)).toEqual(
        updatedUser,
      );
      expect(mockUsersService.editUser).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException if the user to be updated is not found', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };

      // Mock rejection with NotFoundException instead of resolving with null
      mockUsersService.editUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        usersController.editUser('1', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Delete user', () => {
    it('should delete a user by their userId', async () => {
      mockUsersService.deleteUser.mockResolvedValue(mockUser);

      expect(await usersController.deleteUser('1')).toEqual(mockUser);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should return null if the user to be deleted is not found', async () => {
      mockUsersService.deleteUser.mockResolvedValue(null);

      expect(await usersController.deleteUser('1')).toBeNull();
    });
  });
});
