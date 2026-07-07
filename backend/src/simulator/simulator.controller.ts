import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SimulatorService } from './simulator.service';
import { SetMixDto } from './dto/set-mix.dto';

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

  @Post('mix')
  setMix(@Body() dto: SetMixDto) {
    return this.simulatorService.setMix(dto.glovo);
  }
}
