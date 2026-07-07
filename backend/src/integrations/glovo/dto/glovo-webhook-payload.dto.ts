/**
 * Structura este un PLACEHOLDER pentru payload-ul de webhook Glovo.
 * Cand ai acces la documentatia oficiala Glovo Partner API, ajusteaza
 * campurile aici - restul aplicatiei nu trebuie schimbat.
 */
export interface GlovoWebhookPayload {
  order_id: string;
  order_status: string;
  customer: {
    name?: string;
    phone_number?: string;
  };
  delivery_address?: string;
  currency_code: string;
  order_total_price: number;
  order_items: Array<{
    id?: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  placed_at: string;
}
