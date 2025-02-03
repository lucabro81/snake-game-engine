import { GameConfig, RenderConfig, Vector2D } from "@/types";
import { Snake } from "./snake";
import { randomInt, toVector2D } from "@/utils";

interface Player {
  id: string;
  snake: Vector2D[];
}

interface GameState {
  players: { id: string, snake: Vector2D[] }[];
  foodPosition: Vector2D;
}

interface MultiplayerConfig {
  onFoodCollected: (data: {
    collectedBy: string,
    newFoodPosition: Vector2D
  }) => void;
  onPlayerPositionUpdate: (playerId: string, positions: Vector2D[]) => void;
  onPlayerDied: (playerId: string, finalPositions: Vector2D[]) => void;
}

export class MultiplayerSnake<T> extends Snake<T> {
  private players: Map<string, Player> = new Map();
  private playerId: string;
  private multiplayerConfig: MultiplayerConfig;

  constructor(
    playerId: string,
    config: GameConfig,
    renderConfig: RenderConfig<T>,
    multiplayerConfig: MultiplayerConfig,
    onGameOver: () => void,
  ) {
    // Create wrapped onGameOver that notifies about death first
    const wrappedOnGameOver = () => {
      this.multiplayerConfig.onPlayerDied(this.playerId, this.snake);
      onGameOver();
    };

    super(config, renderConfig, wrappedOnGameOver);
    this.playerId = playerId;
    this.multiplayerConfig = multiplayerConfig;

    this.players.set(playerId, {
      id: playerId,
      snake: this.snake
    });
  }

  // Get a random available position from the grid
  getRandomStartPosition(): Vector2D {
    const l = this.grid.positionsEmpty.length;
    if (l === 0) {
      throw new Error('No empty positions available');
    }
    const randomIndex = randomInt(0, l - 1);
    const randomPosition = this.grid.positionsEmpty[randomIndex];
    return toVector2D(randomPosition);
  }

  receivePlayerUpdate(playerId: string, newPositions: Vector2D[]) {
    if (playerId !== this.playerId) {
      this.updatePlayerPosition(playerId, newPositions);
    }
  }

  protected override thereIsAFoodCollision(newHead: Vector2D): boolean {
    const collision = super.thereIsAFoodCollision(newHead);

    if (collision) {
      this.multiplayerConfig.onFoodCollected({
        collectedBy: this.playerId,
        newFoodPosition: this.food
      });
    }

    return collision;
  }

  updateFoodPosition(newPosition: Vector2D) {
    if (this.lastFoodRendered) {
      this.removeOldFood(this.lastFoodRendered);
    }
    this.food = newPosition;
    this.lastFoodRendered = this.renderConfig.foodRenderer(this.food);
    if (this.lastFoodRendered) {
      this.grid.set(this.food, this.lastFoodRendered);
    }
  }

  getPlayerState(): Vector2D[] {
    return this.snake;
  }

  getGameState(): GameState {
    return {
      players: Array.from(this.players.values()).map(player => ({
        id: player.id,
        snake: player.snake
      })),
      foodPosition: this.food
    };
  }

  addPlayer(playerId: string, initialPosition: Vector2D) {
    if (!this.players.has(playerId)) {
      const newPlayer: Player = {
        id: playerId,
        snake: [initialPosition]
      };

      this.players.set(playerId, newPlayer);
      this.grid.set(initialPosition, this.renderConfig.snakeRenderer(initialPosition));
    }
  }

  removePlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (player) {
      player.snake.forEach(position => {
        const element = this.grid.get(position);
        if (element) {
          this.renderConfig.clearRenderer(element);
          this.grid.clear(position);
        }
      });

      this.players.delete(playerId);
    }
  }

  updatePlayerPosition(playerId: string, newPositions: Vector2D[]) {
    const player = this.players.get(playerId);
    if (player && playerId !== this.playerId) {
      player.snake.forEach(position => {
        const element = this.grid.get(position);
        if (element) {
          this.renderConfig.clearRenderer(element);
          this.grid.clear(position);
        }
      });

      player.snake = newPositions;
      newPositions.forEach(position => {
        this.grid.set(position, this.renderConfig.snakeRenderer(position));
      });

      this.multiplayerConfig.onPlayerPositionUpdate(playerId, newPositions);
    }
  }

  protected isSnakeCollision(position: Vector2D): boolean {
    if (super.isSnakeCollision(position)) {
      return true;
    }

    for (const [id, player] of this.players) {
      if (id !== this.playerId) {
        if (player.snake.some(segment =>
          segment.x === position.x && segment.y === position.y
        )) {
          return true;
        }
      }
    }

    return false;
  }
}