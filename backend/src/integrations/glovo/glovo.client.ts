import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Client REST catre Glovo Partner API, folosit pentru a trimite
 * inapoi confirmari/status-uri (accept, ready for pickup etc).
 * TODO: verifica in documentatia oficiala Glovo endpoint-urile si
 * modul de autentificare exacte.
 */
@Injectable()
export class GlovoClient {
  private readonly logger = new Logger(GlovoClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.http = axios.create({
      baseURL: this.configService.get<string>('glovo.apiBaseUrl'),
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('glovo.apiKey')}`,
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    });
  }

  async updateOrderStatus(externalOrderId: string, status: string): Promise<void> {
    if (!this.configService.get<string>('glovo.apiKey')) {
      this.logger.warn(
        `[placeholder] status ${status} pentru comanda Glovo ${externalOrderId} NU a fost trimis (API key lipsa).`,
      );
      return;
    }

    try {
      await this.http.post(`/orders/${externalOrderId}/status`, { status });
    } catch (error) {
      this.logger.error(
        `Eroare la trimiterea statusului catre Glovo pentru comanda ${externalOrderId}`,
        error,
      );
    }
  }
}
