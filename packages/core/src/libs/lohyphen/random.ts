export function randomNumber({ min, max }: { min: number; max: number }) {
  return Math.random() * (max - min) + min;
}
