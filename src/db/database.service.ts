import { Injectable, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    await this.connectToDatabase();
  }

  private async connectToDatabase() {
    try {
      const databaseUrl = process.env.MONGO_DB_URL;
      if (!databaseUrl) {
        throw new Error('No database url');
      }
      await mongoose.connect(databaseUrl);

      console.log('Connected to database');
    } catch (error) {
      console.error('Problem connecting to database', error);
      process.exit(1);
    }
  }
}
