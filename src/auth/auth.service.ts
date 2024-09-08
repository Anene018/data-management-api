import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { LoginDto, UserDto } from './dto';
import * as argon from 'argon2';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

// authentication service
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwt: JwtService,
  ) {}

  // service to create a new user
  async register(userDto: UserDto): Promise<{ access_token: string }> {
    //save new user to db
    try {
      const user = await this.userModel.create(userDto);

      return this.signToken(user.userId, user.email);
    } catch (error) {
      if (error.code === 11000) {
        ///monodb duplicate error
        throw new ConflictException('User with email exists ');
      }
    }
    throw error;
  }

  // servie to login a registered user
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    // find user by email
    const user = await this.userModel.findOne({ email: loginDto.email });

    // if user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // compare password
    const comparePassword = await argon.verify(
      user.password,
      loginDto.password,
    );
    // if password is incorrect throw exception
    if (!comparePassword) {
      throw new ForbiddenException('Credentials incorrect');
    }

    //return user token
    return this.signToken(user.userId, user.email);
  }

  // token genenartion
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    // token
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: process.env.JWT_SECRET,
    });

    // returning jwt token
    return {
      access_token: token,
    };
  }
}
