export interface Product { id: number; name: string; price: number }

// Expected catalogue for standard_user, in default (A to Z) order. `id` is the number the shop stores in its cart.
export const catalog: Product[] = [
  { id: 4, name: 'Sauce Labs Backpack', price: 29.99 },
  { id: 0, name: 'Sauce Labs Bike Light', price: 9.99 },
  { id: 1, name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { id: 5, name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { id: 2, name: 'Sauce Labs Onesie', price: 7.99 },
  { id: 3, name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

export const byName = (name: string): Product => {
  const p = catalog.find((x) => x.name === name);
  if (!p) throw new Error(`Unknown product: ${name}`);
  return p;
};

export const TAX_RATE = 0.08;
export const round2 = (n: number): number => Math.round(n * 100) / 100;
