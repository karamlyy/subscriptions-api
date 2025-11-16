import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type BillingCycle = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Netflix, Spotify...

  @Column({ length: 50, nullable: true })
  category: string; // Entertainment, Productivity...

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 3 })
  currency: string; // AZN, USD, EUR...

  @Column({ type: 'varchar', length: 10 })
  billingCycle: BillingCycle; // DAILY/WEEKLY/MONTHLY/YEARLY

  @Column({ type: 'date' })
  firstPaymentDate: Date;

  @Column({ type: 'date' })
  nextPaymentDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}