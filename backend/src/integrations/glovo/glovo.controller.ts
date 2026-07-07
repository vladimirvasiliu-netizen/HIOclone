import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GlovoService } from './glovo.service';
import { GlovoWebhookPayload } from './dto/glovo-webhook-payload.dto';

@ApiTags('integrations/glovo')
@Controller('integrations/glovo')
export class GlovoController {
  constructor(private readonly glovoService: GlovoService) {}

  /**
   * Endpoint de webhook expus catre Glovo: acesta este URL-ul pe care
   * il vei configura in panoul de partener Glovo pentru notificari de comenzi.
   * Necesita `rawBody: true` activat in main.ts pentru verificarea semnaturii.
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() payload: GlovoWebhookPayload,
    @Headers('x-glovo-signature') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    const rawBody = request.rawBody?.toString('utf-8') ?? JSON.stringify(payload);

    if (!this.glovoService.verifySignature(rawBody, signature)) {
      throw new UnauthorizedException('Semnatura webhook Glovo invalida');
    }

    await this.glovoService.handleWebhook(payload);
    return { received: true };
  }
}
