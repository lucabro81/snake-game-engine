export interface Vector2D {
  x: number;
  y: number;
}

export interface ScoreConfig {
  foodMultiplier: number;
  movementMultiplier: number;
  useSnakeLength: boolean;
  calculateScore?: (
    currentScore: number,
    points: number,
    isFoodCollision: boolean,
    snakeLength: number
  ) => number;
  onScoreUpdate?: (score: number) => void;
}

export interface GameConfig {
  width: number;
  height: number;
  tickRate: number;
  continuousSpace: boolean;
  scoreConfig: ScoreConfig;
}

export interface RenderConfig<T> {
  cellSize: number;
  snakeRenderer: (position: Vector2D) => T;
  foodRenderer: (position: Vector2D) => T;
  clearRenderer: (element?: T) => void;
}