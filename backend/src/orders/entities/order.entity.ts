import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderPlatform } from '../../common/enums/order-platform.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';

/** O intrare din istoricul de status: ce status si cand a fost setat. */
export interface StatusHistoryEntry {
  status: OrderStatus;
  at: string; // ISO timestamp
}

@Entity('orders')
@Index(['platform', 'externalOrderId'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: OrderPlatform })
  platform: OrderPlatform;

  /** ID-ul comenzii asa cum e cunoscut de Bolt Food / Glovo */
  @Column({ name: 'external_order_id' })
  externalOrderId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Column({ name: 'customer_name', nullable: true })
  customerName?: string;

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone?: string;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  deliveryAddress?: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ default: 'RON' })
  currency: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  /** Payload-ul original primit de la platforma - util pentru debugging/audit */
  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload: Record<string, unknown>;

  /** Istoricul schimbarilor de status, cu ora fiecarei tranzitii. */
  @Column({ name: 'status_history', type: 'jsonb', default: () => "'[]'" })
  statusHistory: StatusHistoryEntry[];

  @Column({ name: 'placed_at', type: 'timestamptz' })
  placedAt: Date;

  @Column({ name: 'estimated_delivery_at', type: 'timestamptz', nullable: true })
  estimatedDeliveryAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
