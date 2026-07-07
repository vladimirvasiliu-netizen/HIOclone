/**
 * Structura este un PLACEHOLDER, construita pe baza formatului tipic
 * folosit de API-uri de food-delivery. Cand ai acces la documentatia
 * oficiala de partener Bolt Food, ajusteaza campurile aici - restul
 * aplicatiei nu trebuie schimbat, pentru ca mapper-ul izoleaza diferentele.
 */
export interface BoltFoodOrderPayload {
  orderId: string;
  status: string;
  customer: {
    name?: string;
    phone?: string;
  };
  deliveryAddress?: string;
  currency: string;
  totalPrice: number;
  items: Array<{
    id?: string;
    name: string;
    quantity: number;
    price: number;
    comment?: string;
  }>;
  createdAt: string;
}
