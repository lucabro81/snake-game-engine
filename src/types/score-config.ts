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