import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guard';

// all routes here are protected by the JwtGuard
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // controller to get all users
  @Get()
  findAllUsers() {
    return this.usersService.findAllUsers();
  }
  // get user by id
  @Get(':id')
  getUser(@Param('id') userId: string) {
    return this.usersService.getuser(Number(userId));
  }

  // gets a user by id and updates the user details
  @Put(':id')
  editUser(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.editUser(Number(userId), updateUserDto);
  }

  //gets user by id and deletes user
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(Number(userId));
  }
}
