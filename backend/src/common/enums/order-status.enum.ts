/**
 * Status unificat, indiferent de platforma sursa.
 * Fiecare mapper (bolt-food.mapper.ts / glovo.mapper.ts) traduce
 * statusul specific platformei in unul dintre aceste valori.
 */
export enum OrderStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  IN_PREPARATION = 'IN_PREPARATION',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}
