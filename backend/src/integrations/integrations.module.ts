import { Module } from '@nestjs/common';
import { BoltFoodModule } from './bolt-food/bolt-food.module';
import { GlovoModule } from './glovo/glovo.module';

@Module({
  imports: [BoltFoodModule, GlovoModule],
})
export class IntegrationsModule {}
