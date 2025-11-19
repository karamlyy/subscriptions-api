import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './subscription.entity';
import { User } from '../users/user.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionReminderService } from './subscription-reminder.service';
import { NotificationsModule } from '../notification/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, User]), NotificationsModule],
  providers: [SubscriptionsService, SubscriptionReminderService],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}