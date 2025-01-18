export interface Vector2D {
  x: number;
  y: number;
}

export interface GameConfig {
  width: number;
  height: number;
  tickRate: number;
  countinuosSpace: boolean;
}

export interface RenderConfig<T> {
  cellSize: number;
  snakeRenderer: (position: Vector2D) => T;
  foodRenderer: (position: Vector2D) => T;
  clearRenderer: (element?: T) => void;
}