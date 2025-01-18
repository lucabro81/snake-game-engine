import { Vector2D } from "./types";

export class Grid<T> {
  private grid: Map<string, T>;
  public positionsEmpty: string[] = [];

  constructor(private width: number, private height: number) {
    this.grid = new Map();
    this.initializePositionsGridDict();
  }

  set(position: Vector2D, value: T) {
    this.grid.set(this.getKey(position), value);
    this.positionsEmpty = this.positionsEmpty.filter(pos => pos !== this.getKey(position));
  }

  get(position: Vector2D): T | undefined {
    return this.grid.get(this.getKey(position));
  }

  clear(position: Vector2D) {
    this.grid.delete(this.getKey(position));
    this.positionsEmpty.push(this.getKey(position));
  }

  isInBounds(position: Vector2D): boolean {
    return position.x >= 0 && position.x < this.width &&
      position.y >= 0 && position.y < this.height;
  }

  private getKey(position: Vector2D): string {
    return `${position.x},${position.y}`;
  }

  private initializePositionsGridDict() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.positionsEmpty.push(`${x},${y}`);
      }
    }
  }
}