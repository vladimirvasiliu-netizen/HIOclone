export const SIMULATED_CUSTOMER_NAMES = [
  'Andrei Popescu',
  'Maria Ionescu',
  'Cristian Dumitru',
  'Elena Radu',
  'Alexandru Stan',
  'Ioana Munteanu',
  'Bogdan Constantin',
  'Ana Marinescu',
  'Florin Gheorghe',
  'Diana Petrescu',
];

export const SIMULATED_STREETS = [
  'Str. Mihai Eminescu nr. 12',
  'Bd. Unirii nr. 45',
  'Str. Ștefan cel Mare nr. 8',
  'Str. Independenței nr. 21',
  'Aleea Rozelor nr. 3',
  'Str. Republicii nr. 67',
  'Bd. Carol I nr. 15',
  'Str. Gării nr. 5',
];

export const SIMULATED_MENU_ITEMS: Array<{ name: string; price: number }> = [
  { name: 'Pizza Margherita', price: 32 },
  { name: 'Pizza Quattro Formaggi', price: 38 },
  { name: 'Burger de vită', price: 28 },
  { name: 'Cartofi prăjiți', price: 12 },
  { name: 'Salată Caesar', price: 24 },
  { name: 'Paste Carbonara', price: 30 },
  { name: 'Shaorma de pui', price: 22 },
  { name: 'Sushi mix 12 buc.', price: 45 },
  { name: 'Limonadă', price: 10 },
  { name: 'Coca-Cola 0.5L', price: 8 },
  { name: 'Tiramisu', price: 18 },
  { name: 'Ciorbă de burtă', price: 20 },
];

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
