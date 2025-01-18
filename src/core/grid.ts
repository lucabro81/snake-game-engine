import { Vector2D } from "./types";

export class Grid<T> {
  private grid: Map<string, T>;

  constructor(private width: number, private height: number) {
    this.grid = new Map();
  }

  set(position: Vector2D, value: T) {
    this.grid.set(this.getKey(position), value);
  }

  get(position: Vector2D): T | undefined {
    return this.grid.get(this.getKey(position));
  }

  clear(position: Vector2D) {
    this.grid.delete(this.getKey(position));
  }

  isInBounds(position: Vector2D): boolean {
    return position.x >= 0 && position.x < this.width &&
      position.y >= 0 && position.y < this.height;
  }

  private getKey(position: Vector2D): string {
    return `${position.x},${position.y}`;
  }
}