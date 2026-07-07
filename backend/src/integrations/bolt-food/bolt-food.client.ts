import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { BoltFoodOrderPayload } from './dto/bolt-order-payload.dto';

/**
 * Client REST catre Bolt Food Partner API.
 *
 * TODO: cand ai credentialele reale de partener, verifica in
 * documentatia oficiala Bolt Food:
 *  - modul exact de autentificare (API key in header? OAuth2?)
 *  - endpoint-ul de listare comenzi noi si formatul de paginare
 *  - endpoint-ul de confirmare/actualizare status
 * Restul aplicatiei nu are nevoie de modificari daca aceasta clasa
 * respecta interfata `fetchNewOrders` / `updateOrderStatus`.
 */
@Injectable()
export class BoltFoodClient {
  private readonly logger = new Logger(BoltFoodClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.http = axios.create({
      baseURL: this.configService.get<string>('boltFood.apiBaseUrl'),
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('boltFood.apiKey')}`,
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    });
  }

  /**
   * Intoarce comenzile noi/actualizate de la Bolt Food.
   * PLACEHOLDER: fara credentiale reale, returneaza un array gol
   * si loghezi ca API-ul nu e configurat, in loc sa crape aplicatia.
   */
  async fetchNewOrders(): Promise<BoltFoodOrderPayload[]> {
    if (!this.configService.get<string>('boltFood.apiKey')) {
      this.logger.warn(
        'BOLT_FOOD_API_KEY nu este configurat - se sare peste polling (mod placeholder).',
      );
      return [];
    }

    try {
      const response = await this.http.get<{ orders: BoltFoodOrderPayload[] }>(
        '/orders?status=new',
      );
      return response.data.orders ?? [];
    } catch (error) {
      this.logger.error('Eroare la interogarea Bolt Food API', error);
      return [];
    }
  }

  /** Trimite catre Bolt Food statusul actualizat al unei comenzi. */
  async updateOrderStatus(externalOrderId: string, status: string): Promise<void> {
    if (!this.configService.get<string>('boltFood.apiKey')) {
      this.logger.warn(
        `[placeholder] status ${status} pentru comanda Bolt Food ${externalOrderId} NU a fost trimis (API key lipsa).`,
      );
      return;
    }

    try {
      await this.http.patch(`/orders/${externalOrderId}/status`, { status });
    } catch (error) {
      this.logger.error(
        `Eroare la trimiterea statusului catre Bolt Food pentru comanda ${externalOrderId}`,
        error,
      );
    }
  }
}
