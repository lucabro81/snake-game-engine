import { GameLoop } from "./game-loop";
import { Grid } from "./grid";
import { Vector2D, GameConfig, RenderConfig } from "./types";

export class Snake<T> {
  private grid: Grid<T>;
  private snake: Vector2D[] = [];
  private food: Vector2D | null = null;
  private direction: Vector2D = { x: 1, y: 0 };
  private nextDirection: Vector2D = { x: 1, y: 0 };
  private gameLoop: GameLoop;

  constructor(
    private config: GameConfig,
    private renderConfig: RenderConfig<T>,
    private onGameOver: () => void
  ) {
    this.grid = new Grid(config.width, config.height);
    this.gameLoop = new GameLoop(config.tickRate, this.update.bind(this));
    this.initialize();
  }

  start() {
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }

  setDirection(direction: Vector2D) {
    // Prevent 180-degree turns
    if (this.direction.x + direction.x !== 0 ||
      this.direction.y + direction.y !== 0) {
      this.nextDirection = direction;
    }
  }

  private initialize() {
    // Initial snake position
    const startPos = {
      x: Math.floor(this.config.width / 4),
      y: Math.floor(this.config.height / 2)
    };
    this.snake = [startPos];
    this.grid.set(startPos, this.renderConfig.snakeRenderer(startPos));
    this.spawnFood();
  }

  private update() {
    this.direction = this.nextDirection;
    const head = this.snake[0];
    const newHead: Vector2D = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // Check collisions
    if (!this.grid.isInBounds(newHead) || this.isSnakeCollision(newHead)) {
      this.onGameOver();
      return;
    }

    // Move snake
    this.snake.unshift(newHead);
    this.grid.set(newHead, this.renderConfig.snakeRenderer(newHead));

    // Check food collision
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      this.spawnFood();
    } else {
      const tail = this.snake.pop();
      if (tail) {
        this.grid.set(tail, this.renderConfig.clearRenderer(tail));
      }
    }
  }

  private isSnakeCollision(position: Vector2D): boolean {
    return this.snake.some(segment =>
      segment.x === position.x && segment.y === position.y
    );
  }

  private spawnFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.config.width),
        y: Math.floor(Math.random() * this.config.height)
      };
    } while (this.isSnakeCollision(this.food));

    if (this.food) {
      this.grid.set(this.food, this.renderConfig.foodRenderer(this.food));
    }
  }
}
