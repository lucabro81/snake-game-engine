import { Vector2D } from "./vector-2D";

export interface RenderConfig<T> {
  cellSize: number;
  snakeRenderer: (position: Vector2D) => T;
  foodRenderer: (position: Vector2D) => T;
  clearRenderer: (element?: T) => void;
} 