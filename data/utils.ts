export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function roll(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}
