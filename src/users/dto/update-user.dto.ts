import { PartialType } from '@nestjs/mapped-types';
import { UserDto } from 'src/auth/dto';

export class UpdateUserDto extends PartialType(UserDto) {}
