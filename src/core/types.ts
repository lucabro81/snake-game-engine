export interface Vector2D {
  x: number;
  y: number;
}

export interface GameConfig {
  width: number;
  height: number;
  tickRate: number;
}

export interface RenderConfig<T> {
  cellSize: number;
  snakeRenderer: (position: Vector2D) => T;
  foodRenderer: (position: Vector2D) => T;
  clearRenderer: (position: Vector2D) => T;
}