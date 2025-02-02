import { GameConfig, RenderConfig, Vector2D } from "@/types";
import { Snake } from "./snake";

interface SnakePlayer {
  body: Vector2D[];
  direction: Vector2D;
  score: number;
}

export class MultiplayerSnake<T> extends Snake<T> {
  private player2: SnakePlayer = {
    body: [],
    direction: { x: -1, y: 0 }, // Start moving left
    score: 0
  };

  constructor(
    config: GameConfig,
    renderConfig: RenderConfig<T>,
    onGameOver: () => void,
  ) {
    super(config, renderConfig, onGameOver);
    this.initializeSecondPlayer();
  }

  private initializeSecondPlayer() {
    const startPos = {
      x: Math.floor(this.config.width * 0.75), // Start on the right side
      y: Math.floor(this.config.height * 0.5)
    };

    this.player2.body = [startPos];
    this.grid.set(startPos, this.renderConfig.snakeRenderer(startPos));
  }

  setPlayer2Direction(direction: Vector2D) {
    if (this.isValidDirectionChange(direction, this.player2.direction)) {
      this.player2.direction = direction;
    }
  }

  private isValidDirectionChange(newDir: Vector2D, currentDir: Vector2D): boolean {
    // Prevent 180-degree turns
    return (newDir.x + currentDir.x !== 0) || (newDir.y + currentDir.y !== 0);
  }

  protected override update() {
    // First, update player 1 (using parent class's snake array)
    super.update();

    // Then update player 2
    this.updatePlayer2();
  }

  private updatePlayer2() {
    // Calculate new head position
    const head = this.player2.body[0];
    const newHead = {
      x: head.x + this.player2.direction.x,
      y: head.y + this.player2.direction.y
    };

    // Check for collisions
    if (!this.grid.isInBounds(newHead) || this.isSnakeCollision(newHead)) {
      this.onGameOver();
      return;
    }

    // Move snake
    this.player2.body.unshift(newHead);
    this.grid.set(newHead, this.renderConfig.snakeRenderer(newHead));

    // Remove tail unless growing
    const tail = this.player2.body.pop();
    if (tail) {
      this.grid.clear(tail);
    }
  }

  // Override collision check to include both snakes
  protected override isSnakeCollision(position: Vector2D): boolean {
    // Check collision with first snake (super.snake contains player 1's body)
    const player1Collision = super.isSnakeCollision(position);

    // Check collision with second snake
    const player2Collision = this.player2.body.some(segment =>
      segment.x === position.x && segment.y === position.y
    );

    return player1Collision || player2Collision;
  }


}