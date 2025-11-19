import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { FcmService } from '../notification/fcm.service';

@Injectable()
export class SubscriptionReminderService {
  private readonly logger = new Logger(SubscriptionReminderService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    private readonly fcmService: FcmService,
  ) {}

  // Gündə 1 dəfə, saat 09:00-da (node-cron: second minute hour day month dow)
  @Cron('0 00 17 * * *')
  async sendUpcomingPaymentReminders(): Promise<void> {
    this.logger.log('Running subscription reminder cron job...');

    const now = new Date();
    const today = this.toMidnight(now);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Yalnız bu gün – 3 gün sonrası aralığındakı ödənişləri götürürük
    const subs = await this.subRepo.find({
      where: {
        isActive: true,
        nextPaymentDate: Between(today, threeDaysLater),
      },
      relations: ['user'],
    });

    this.logger.log(
      `Found ${subs.length} subscriptions with payments in next 3 days`,
    );

    for (const sub of subs) {
      const user = sub.user as { fcmToken?: string | null } | undefined;
      if (!user || !user.fcmToken) {
        continue;
      }

      const nextPayment = this.toMidnight(
        sub.nextPaymentDate instanceof Date
          ? sub.nextPaymentDate
          : new Date(sub.nextPaymentDate),
      );

      const daysDiff = this.diffInDays(nextPayment, today);
      // - 0 → bu gün
      // - 1 → sabah
      // - 3 → 3 gün sonra və s.

      const priceNumber = Number(sub.price);
      const priceText = Number.isNaN(priceNumber)
        ? String(sub.price)
        : priceNumber.toFixed(2);

      let title: string | null = null;
      let body: string | null = null;

      if (daysDiff === 3) {
        title = '3 gün sonra abunəlik ödənişin var';
        body =
          `3 gün sonra ${sub.name} üçün ` +
          `${priceText} ${sub.currency} ödəniş olunacaq.`;
      } else if (daysDiff === 1) {
        title = 'Sabah abunəlik ödənişin var';
        body =
          `Sabah ${sub.name} üçün ` +
          `${priceText} ${sub.currency} ödəniş olunacaq.`;
      } else if (daysDiff === 0) {
        title = 'Bu gün abunəlik ödənişin var';
        body =
          `Bu gün ${sub.name} üçün ` +
          `${priceText} ${sub.currency} ödəniş olunacaq.`;
      }

      if (title && body) {
        await this.fcmService.sendToToken(user.fcmToken, title, body);
      }
    }
  }

  /**
   * Tarixi saat/minut/saniyə sıfırlanmış hala salır (yalnız "gün" səviyyəsində müqayisə üçün).
   */
  private toMidnight(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * İki tarix arasındakı gün fərqini hesablayır (təkcə gün, zaman hissəsi nəzərə alınmadan).
   */
  private diffInDays(a: Date, b: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcA - utcB) / msPerDay);
  }
}