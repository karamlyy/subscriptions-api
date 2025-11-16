import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, BillingCycle } from './subscription.entity';
import { User } from '../users/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subsRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findAllForUser(userId: number) {
    return this.subsRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(userId: number, id: number) {
    const sub = await this.subsRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!sub) {
      throw new NotFoundException('Subscription tapılmadı');
    }

    if (sub.user.id !== userId) {
      throw new ForbiddenException('Bu subscription-a çıxış icazən yoxdur');
    }

    return sub;
  }

  async createForUser(userId: number, dto: CreateSubscriptionDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tapılmadı');
    }

    const firstDate = new Date(dto.firstPaymentDate);
    const nextDate = this.calculateNextPaymentDate(
      firstDate,
      dto.billingCycle,
    );

    const sub = this.subsRepo.create({
      name: dto.name,
      category: dto.category,
      price: dto.price,
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      firstPaymentDate: firstDate,
      nextPaymentDate: nextDate,
      isActive: dto.isActive ?? true,
      notes: dto.notes,
      user,
    });

    return this.subsRepo.save(sub);
  }

  async updateForUser(userId: number, id: number, dto: UpdateSubscriptionDto) {
    const sub = await this.findOneForUser(userId, id);

    if (dto.firstPaymentDate || dto.billingCycle) {
      const first =
        dto.firstPaymentDate !== undefined
          ? new Date(dto.firstPaymentDate)
          : sub.firstPaymentDate;

      const billingCycle =
        dto.billingCycle !== undefined ? dto.billingCycle : sub.billingCycle;

      sub.firstPaymentDate = first;
      sub.billingCycle = billingCycle;
      sub.nextPaymentDate = this.calculateNextPaymentDate(first, billingCycle);
    }

    if (dto.name !== undefined) sub.name = dto.name;
    if (dto.category !== undefined) sub.category = dto.category;
    if (dto.price !== undefined) sub.price = dto.price;
    if (dto.currency !== undefined) sub.currency = dto.currency;
    if (dto.isActive !== undefined) sub.isActive = dto.isActive;
    if (dto.notes !== undefined) sub.notes = dto.notes;

    sub.updatedAt = new Date();

    return this.subsRepo.save(sub);
  }

  async deleteForUser(userId: number, id: number) {
    const sub = await this.findOneForUser(userId, id);
    await this.subsRepo.delete(sub.id);
  }

  private calculateNextPaymentDate(
    firstPaymentDate: Date,
    billingCycle: BillingCycle,
  ): Date {
    const next = new Date(firstPaymentDate);

    switch (billingCycle) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }
}