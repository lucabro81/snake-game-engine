import { randomInt, toVector2D } from "@/utils";
import { GameLoop } from "./game-loop";
import { Grid } from "./grid";
import { GameConfig, RenderConfig, Vector2D } from "@/types";

export class Snake<T> {
  protected grid: Grid<T>;
  protected snake: Vector2D[] = [];
  protected food: Vector2D = { x: 0, y: 0 };
  protected direction: Vector2D = { x: 1, y: 0 };
  protected directionQueue: Vector2D[] = [];
  protected gameLoop: GameLoop;
  protected letSnakeGrow = false;
  protected lastFoodRendered?: T;
  protected continuousSpace = false;
  protected score = 0;

  get lastDirection(): Vector2D {
    return this.directionQueue?.[this.directionQueue.length - 1] ?? this.direction
  }

  get head(): Vector2D {
    return this.snake[0];
  }

  constructor(
    protected config: GameConfig,
    protected renderConfig: RenderConfig<T>,
    protected onGameOver: () => void,
  ) {
    this.continuousSpace = config.continuousSpace;
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
    const startPos = {
      x: Math.floor(randomInt(0, this.config.width)),
      y: Math.floor(randomInt(0, this.config.height))
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

  protected nextDirection(): Vector2D {
    const nextDir = this.directionQueue.shift();
    return nextDir ?? this.direction;
  }

  protected getNewHead(): Vector2D {
    return {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    };
  }

  protected removeTail() {
    const tail = this.snake.pop();
    if (tail) {
      this.renderConfig.clearRenderer(this.grid.get(tail))
      this.grid.clear(tail);
    }
  }

  protected travelHyperspace(newHead: Vector2D): Vector2D {
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

  protected moveSnakeForward(newHead: Vector2D) {
    this.snake.unshift(newHead);
    this.grid.set(newHead, this.renderConfig.snakeRenderer(newHead));
  }

  protected thereIsAFoodCollision(newHead: Vector2D) {
    return this.food && newHead.x === this.food.x && newHead.y === this.food.y
  }

  protected nextTick(): Promise<void> {
    return this.gameLoop.nextTick();
  }

  protected update() {

    this.direction = this.nextDirection();
    let newHead = this.getNewHead();

    if (!this.letSnakeGrow) {
      this.removeTail();
    }

    this.letSnakeGrow = false;

    if (!this.grid.isInBounds(newHead)) {
      if (!this.continuousSpace) {
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

    if (this.thereIsAFoodCollision(newHead)) {
      this.removeOldFood(this.lastFoodRendered);
      this.lastFoodRendered = this.spawnFood();
      this.letSnakeGrow = true;
      this.updateScore(10 * this.snake.length, true);
    }
    else {
      this.updateScore(-this.snake.length);
    }
  }

  protected isSnakeCollision(position: Vector2D): boolean {
    return this.snake.some(segment =>
      segment.x === position.x && segment.y === position.y
    );
  }

  protected removeOldFood(lastFoodRendered?: T) {
    this.renderConfig.clearRenderer(lastFoodRendered);
  }

  protected spawnFood() {

    const l = this.grid.positionsEmpty.length;
    const randomIndex = randomInt(0, l - 1);
    const randomPosition = this.grid.positionsEmpty[randomIndex];

    this.food = toVector2D(randomPosition);

    const lastFoodRendered = this.renderConfig.foodRenderer(this.food);
    if (lastFoodRendered) {
      this.grid.set(this.food, lastFoodRendered);
    }

    return lastFoodRendered;
  }

  private calculatePoints(isFoodCollision: boolean): number {
    const { scoreConfig } = this.config;
    const basePoints = isFoodCollision ?
      scoreConfig.foodMultiplier :
      scoreConfig.movementMultiplier;

    if (scoreConfig.useSnakeLength) {
      return basePoints * this.snake.length;
    }

    return basePoints;
  }

  protected updateScore(points: number, isFoodCollision = false) {
    const { scoreConfig } = this.config;

    let newScore: number;

    if (scoreConfig.calculateScore) {
      newScore = scoreConfig.calculateScore(
        this.score,
        points,
        isFoodCollision,
        this.snake.length
      );
    } else {
      const calculatedPoints = this.calculatePoints(isFoodCollision);
      newScore = Math.max(0, this.score + calculatedPoints);
    }

    this.score = newScore;
    scoreConfig.onScoreUpdate?.(this.score)
  }


}
