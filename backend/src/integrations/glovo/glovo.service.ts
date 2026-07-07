import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OrdersService } from '../../orders/orders.service';
import { GlovoMapper } from './glovo.mapper';
import { GlovoWebhookPayload } from './dto/glovo-webhook-payload.dto';

@Injectable()
export class GlovoService {
  private readonly logger = new Logger(GlovoService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Verifica semnatura trimisa de Glovo pe header (HMAC SHA-256 peste body).
   * TODO: confirma in documentatia Glovo numele exact al header-ului si
   * algoritmul de semnare - aici e o implementare placeholder, comuna
   * pentru webhook-uri de tip HMAC.
   */
  verifySignature(rawBody: string, signatureHeader?: string): boolean {
    const secret = this.configService.get<string>('glovo.webhookSecret');

    if (!secret) {
      this.logger.warn(
        'GLOVO_WEBHOOK_SECRET nu este configurat - se sare peste verificarea semnaturii (mod placeholder).',
      );
      return true;
    }

    if (!signatureHeader) {
      return false;
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader),
    );
  }

  async handleWebhook(payload: GlovoWebhookPayload): Promise<void> {
    const unifiedOrder = GlovoMapper.toUnifiedOrder(payload);
    await this.ordersService.upsertFromUnifiedOrder(unifiedOrder);
    this.logger.log(`Comanda Glovo procesata: ${payload.order_id}`);
  }
}
