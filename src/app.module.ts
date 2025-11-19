import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { User } from './users/user.entity';
import { Subscription } from './subscriptions/subscription.entity';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notification/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Subscription],
      synchronize: true, // dev üçün ok
    }),
    AuthModule,
    SubscriptionsModule,
    UsersModule,
    AiModule,
    NotificationsModule,
  ],
})
export class AppModule {}
