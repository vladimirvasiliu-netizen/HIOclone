import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SimulatorService } from './simulator.service';

@ApiTags('simulator')
@Controller('simulator')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post('start')
  start() {
    return this.simulatorService.start();
  }

  @Post('stop')
  stop() {
    return this.simulatorService.stop();
  }

  @Get('status')
  status() {
    return this.simulatorService.status();
  }
}
