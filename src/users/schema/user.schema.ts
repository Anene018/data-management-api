import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as argon from 'argon2';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, autoIncreament: true })
  userId: number;
}

const UserSchema = SchemaFactory.createForClass(User);

// Hook for hashing user password before saving and storing to database
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await argon.hash(this.password);
  next();
});
export { UserSchema };
