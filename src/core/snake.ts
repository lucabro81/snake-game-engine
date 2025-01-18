import { GameLoop } from "./game-loop";
import { Grid } from "./grid";
import { Vector2D, GameConfig, RenderConfig } from "./types";

export class Snake<T> {
  private grid: Grid<T>;
  private snake: Vector2D[] = [];
  private food: Vector2D | null = null;
  private direction: Vector2D = { x: 1, y: 0 };
  private directionQueue: Vector2D[] = [];
  private gameLoop: GameLoop;
  private letSnakeGrow = false;
  private lastFoodRendered?: T;
  private countinuosSpace = false;
  get lastDirection(): Vector2D {
    return this.directionQueue?.[this.directionQueue.length - 1] ?? this.direction
  }

  get head(): Vector2D {
    return this.snake[0];
  }

  constructor(
    private config: GameConfig,
    private renderConfig: RenderConfig<T>,
    private onGameOver: () => void
  ) {
    this.countinuosSpace = config.countinuosSpace;
    this.grid = new Grid(config.width, config.height);
    this.gameLoop = new GameLoop(config.tickRate, () => this.update());
    this.initialize();
  }

  start() {
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }

  setDirection(direction: Vector2D) {
    if (this.isNot180DegreeTurn(direction) && this.isNewDirectionDifferentFromLastOne(direction)) {
      this.directionQueue.push(direction);
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
    this.lastFoodRendered = this.spawnFood();
  }

  private isNot180DegreeTurn(direction: Vector2D) {
    return this.lastDirection.x + direction.x !== 0 ||
      this.lastDirection.y + direction.y !== 0
  }

  private isNewDirectionDifferentFromLastOne(direction: Vector2D) {
    return this.directionQueue.length === 0 ||
      this.directionQueue[this.directionQueue.length - 1] !== direction
  }

  private nextDirection(): Vector2D {
    return this.directionQueue.length > 0
      ? this.directionQueue.shift()!
      : this.direction;
  }

  private getNewHead(): Vector2D {
    return {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    };
  }

  private removeTail() {
    const tail = this.snake.pop();
    if (tail) {
      this.renderConfig.clearRenderer(this.grid.get(tail))
      this.grid.clear(tail);
    }
  }

  private travelHyperspace(newHead: Vector2D): Vector2D {
    let clonedNewHead = { ...newHead };
    if (this.direction.x > 0) {
      clonedNewHead.x = newHead.x - this.config.width;
    }
    else if (this.direction.x < 0) {
      clonedNewHead.x = newHead.x + this.config.width;
    }
    if (this.direction.y > 0) {
      clonedNewHead.y = newHead.y - this.config.height;
    }
    else if (this.direction.y < 0) {
      clonedNewHead.y = newHead.y + this.config.height;
    }
    return clonedNewHead;
  }

  private moveSnakeForward(newHead: Vector2D) {
    this.snake.unshift(newHead);
    this.grid.set(newHead, this.renderConfig.snakeRenderer(newHead));
  }

  private thereIsAFoodCollision(newHead: Vector2D) {
    return this.food && newHead.x === this.food.x && newHead.y === this.food.y
  }

  private update() {

    this.direction = this.nextDirection();
    let newHead = this.getNewHead();

    if (!this.letSnakeGrow) {
      this.removeTail();
    }

    this.letSnakeGrow = false;

    if (!this.grid.isInBounds(newHead)) {
      if (!this.countinuosSpace) {
        this.onGameOver();
        return;
      }
      else {
        newHead = this.travelHyperspace(newHead);
      }
    }


    if (this.isSnakeCollision(newHead)) {
      this.onGameOver();
      return;
    }

    this.moveSnakeForward(newHead);

    // Check food collision
    if (this.thereIsAFoodCollision(newHead)) {
      this.removeOldFood(this.lastFoodRendered);
      this.lastFoodRendered = this.spawnFood();
      this.letSnakeGrow = true;
    }
  }

  private isSnakeCollision(position: Vector2D): boolean {
    return this.snake.some(segment =>
      segment.x === position.x && segment.y === position.y
    );
  }

  private removeOldFood(lastFoodRendered?: T) {
    this.renderConfig.clearRenderer(lastFoodRendered);
  }

  private spawnFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.config.width),
        y: Math.floor(Math.random() * this.config.height)
      };
    } while (this.isSnakeCollision(this.food));

    const lastFoodRendered = this.renderConfig.foodRenderer(this.food);
    if (lastFoodRendered) {
      this.grid.set(this.food, lastFoodRendered);
    }

    return lastFoodRendered;
  }
}
