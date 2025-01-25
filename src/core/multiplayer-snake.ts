import { RenderConfig, Vector2D } from "@/types";
import { Snake } from "./snake";
import { MultiplayerConfig, NetworkEvents } from "@/types/multiplayer";

type UpdateType = 'snake' | 'food';
type PayloadType = {
  positions?: Vector2D[];
  food?: Vector2D;
};

export class MultiplayerSnake<T> extends Snake<T> implements NetworkEvents<UpdateType, PayloadType> {
  private readonly playerId: string;
  private readonly isHost: boolean;
  private otherPlayers: Map<string, Vector2D[]> = new Map();
  protected override snake: Vector2D[] = [];
  protected override food: Vector2D = { x: 0, y: 0 };

  constructor(
    config: MultiplayerConfig,
    renderConfig: RenderConfig<T>,
    onGameOver: () => void,
    // private networkEvents: NetworkEvents
  ) {
    const { playerId, isHost, ...baseConfig } = config;
    super(baseConfig, renderConfig, onGameOver);
    this.playerId = playerId;
    this.isHost = isHost;
    // this.setupNetworkEvents();
  }

  // private setupNetworkEvents() {

  //   // this.networkEvents.onPlayerJoined = (playerId: string) => {
  //   //   this.otherPlayers.set(playerId, []);
  //   // };

  //   // this.networkEvents.onPlayerLeft = (playerId: string) => {
  //   //   const positions = this.otherPlayers.get(playerId) || [];
  //   //   // Clear other player's snake from the grid
  //   //   positions.forEach(pos => {
  //   //     this.grid.clear(pos);
  //   //   });
  //   //   this.otherPlayers.delete(playerId);
  //   // };

  //   // if (this.networkEvents.onSnakeUpdate) {
  //   //   this.networkEvents.onSnakeUpdate((playerId: string, positions: Vector2D[]) => {
  //   //     if (playerId !== this.playerId) {
  //   //       this.updateOtherPlayerSnake(playerId, positions);
  //   //     }
  //   //   });
  //   // }

  //   // if (!this.isHost && this.networkEvents.onFoodUpdate) {
  //   //   this.networkEvents.onFoodUpdate((food: Vector2D) => {
  //   //     this.updateFoodPosition(food);
  //   //   });
  //   // }
  // }

  onPlayerLeft(playerId: string) {
    const positions = this.otherPlayers.get(playerId) || [];
    // Clear other player's snake from the grid
    positions.forEach(pos => {
      this.grid.clear(pos);
    });
    this.otherPlayers.delete(playerId);
  }

  onPlayerJoined(playerId: string) {
    this.otherPlayers.set(playerId, []);
  }

  onReceivedUpdate(type: UpdateType, playerId: string, payload: PayloadType) {
    if (type === 'snake') {
      if (playerId !== this.playerId) {
        payload?.positions && this.updateOtherPlayerSnake(playerId, payload?.positions);
      }
      return;
    }

    if (type === 'food') {
      payload?.food && this.updateFoodPosition(payload?.food);
      return;
    }
  }

  onBroadcastUpdate(type: UpdateType, playerId: string, payload: PayloadType) {
    if (type === 'snake') {
      payload?.positions && this.updateOtherPlayerSnake(playerId, payload?.positions);
    }
    if (type === 'food') {
      payload?.food && this.updateFoodPosition(payload?.food);
    }
  }



  protected override update() {
    // Call base class update
    super.update();

    // Broadcast local snake state after update
    this.onBroadcastUpdate('snake', this.playerId, { positions: [...this.snake] });

    // If host, broadcast food position
    if (this.isHost && this.food) {
      this.onBroadcastUpdate('food', this.playerId, { food: this.food });
    }
  }

  protected override isSnakeCollision(position: Vector2D): boolean {
    // Check collision with own snake
    if (super.isSnakeCollision(position)) {
      return true;
    }

    // Check collision with other players' snakes
    return Array.from(this.otherPlayers.values()).some(snake =>
      snake.some(segment =>
        segment.x === position.x && segment.y === position.y
      )
    );
  }

  protected override spawnFood(): T | undefined {
    // Only host can spawn food
    if (!this.isHost) {
      return undefined;
    }
    return super.spawnFood();
  }


  private updateOtherPlayerSnake(playerId: string, positions: Vector2D[]) {
    const oldPositions = this.otherPlayers.get(playerId) || [];

    // Clear old positions from grid
    oldPositions.forEach(pos => {
      const element = this.grid.get(pos);
      if (element) {
        this.renderConfig.clearRenderer(element);
      }
      this.grid.clear(pos);
    });

    // Set new positions
    positions.forEach(pos => {
      this.grid.set(pos, this.renderConfig.snakeRenderer(pos, playerId));
    });

    this.otherPlayers.set(playerId, positions);
  }

  private updateFoodPosition(newFood: Vector2D) {
    if (this.lastFoodRendered) {
      this.renderConfig.clearRenderer(this.lastFoodRendered);
    }

    this.food = newFood;
    this.lastFoodRendered = this.renderConfig.foodRenderer(this.food);
    if (this.lastFoodRendered) {
      this.grid.set(this.food, this.lastFoodRendered);
    }
  }

  // Override setDirection to broadcast direction changes
  public override setDirection(direction: Vector2D) {
    super.setDirection(direction);
    this.onBroadcastUpdate('snake', this.playerId, { positions: [...this.snake] });
  }
}