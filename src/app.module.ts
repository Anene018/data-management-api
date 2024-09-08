import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/database.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    DatabaseModule,
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
