import { IsEnum, IsOptional } from 'class-validator';
import { OrderPlatform } from '../../common/enums/order-platform.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class QueryOrdersDto {
  @IsOptional()
  @IsEnum(OrderPlatform)
  platform?: OrderPlatform;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
