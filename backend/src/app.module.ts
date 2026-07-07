import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { OrdersModule } from './orders/orders.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SimulatorModule } from './simulator/simulator.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Order, OrderItem],
        synchronize: configService.get('database.synchronize'),
      }),
    }),
    ScheduleModule.forRoot(),
    OrdersModule,
    IntegrationsModule,
    SimulatorModule,
  ],
})
export class AppModule {}
