import { Vector2D } from "./types";

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function toVector2D(position: string): Vector2D {
  const [x, y] = position.split(',').map(Number);
  return { x, y };
}