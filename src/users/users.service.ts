import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // service to get all registered users
  async findAllUsers(): Promise<User[]> {
    const users = await this.userModel.find();

    // checking if there are users in the database
    if (!users || users.length === 0) {
      throw new NotFoundException('No user found');
    }
    return users;
  }

  // service to get a user by their userId
  async getuser(userId: number): Promise<User> {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      throw new NotFoundException(`No user with userId ${userId} found`);
    }
    return user;
  }

  // service to edit a user
  async editUser(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      {
        userId: userId,
      },
      { $set: updateUserDto },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException(`No user with userId ${userId} found`);
    }
    return user;
  }

  // service to delete a user
  async deleteUser(userId: number): Promise<void> {
    return await this.userModel.findOneAndDelete({ userId });
  }
}
