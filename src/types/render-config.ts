import { Vector2D } from "./vector-2D";

export interface RenderConfig<T> {
  cellSize: number;
  snakeRenderer: (position: Vector2D, playerId?: string) => T;
  foodRenderer: (position: Vector2D, playerId?: string) => T;
  clearRenderer: (element?: T) => void;
} 