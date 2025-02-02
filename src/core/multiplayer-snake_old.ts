import { RenderConfig, Vector2D } from "@/types";
import { Snake } from "./snake";
import type { MultiplayerConfig, NetworkEvents, PayloadType, UpdateType } from "@/types/multiplayer";

export class MultiplayerSnake<T> extends Snake<T> implements NetworkEvents<UpdateType, PayloadType> {
  private readonly playerId: string;
  private readonly isHost: boolean;
  private otherPlayers: Map<string, Vector2D[]> = new Map();
  protected override food: Vector2D = { x: 0, y: 0 };

  constructor(
    config: MultiplayerConfig,
    renderConfig: RenderConfig<T>,
    onGameOver: () => void,
  ) {
    const { playerId, isHost, ...baseConfig } = config;
    super(baseConfig, renderConfig, onGameOver);
    this.playerId = playerId;
    this.isHost = isHost;
    (this.config as MultiplayerConfig).networkEvents.onReceivedUpdate = this.onReceivedUpdate;
  }

  onPlayerLeft(playerId: string) {
    const positions = this.otherPlayers.get(playerId) || [];
    // Clear other player's snake from the grid
    positions.forEach(pos => {
      this.grid.clear(pos);
    });
    this.otherPlayers.delete(playerId);
    (this.config as MultiplayerConfig).networkEvents?.onPlayerLeft(playerId);
  }

  onPlayerJoined(playerId: string) {
    (this.config as MultiplayerConfig).networkEvents?.onPlayerJoined(playerId);
    this.otherPlayers.set(playerId, []);
  }

  onReceivedUpdate(type: UpdateType, playerId: string, payload: PayloadType) {

    (this.config as MultiplayerConfig).networkEvents?.onReceivedUpdate(type, playerId, payload);
    if (type === 'snake_updated') {
      if (playerId !== this.playerId) {
        payload?.positions && this.updateOtherPlayerSnake(playerId, payload?.positions);
        (this.config as MultiplayerConfig).networkEvents?.onReceivedUpdate(type, playerId, payload);
      }
      return;
    }

    // if (type === 'food') {
    //   payload?.food && this.updateFoodPosition(payload?.food);
    //   return;
    // }
  }

  onBroadcastUpdate(type: UpdateType, playerId: string, payload: PayloadType) {

    // if (type === 'snake') {
    //   payload?.positions && this.updateOtherPlayerSnake(playerId, payload?.positions);
    // }
    // if (type === 'food') {
    //   payload?.food && this.updateFoodPosition(payload?.food);
    // }
    (this.config as MultiplayerConfig).networkEvents?.onBroadcastUpdate(type, playerId, payload);
  }

  protected override update() {
    super.update();

    this.onBroadcastUpdate('update_snake', this.playerId, { positions: [...this.snake] });

    // if (this.isHost && this.food) {
    //   this.onBroadcastUpdate('food', this.playerId, { food: this.food });
    // }
  }

  protected override isSnakeCollision(position: Vector2D): boolean {
    if (super.isSnakeCollision(position)) {
      return true;
    }

    return this.areThereCollisionsBetweenSnakes(position);
  }

  protected override spawnFood() {
    if (!this.isHost) {
      // Return the current food position if not host
      return this.food as T;
    }
    return super.spawnFood();
  }

  private areThereCollisionsBetweenSnakes(position: Vector2D) {
    return Array.from(this.otherPlayers.values()).some(snake =>
      snake.some(segment =>
        segment.x === position.x && segment.y === position.y
      )
    );
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

  // private updateFoodPosition(newFood: Vector2D) {
  //   if (this.lastFoodRendered) {
  //     this.renderConfig.clearRenderer(this.lastFoodRendered);
  //   }

  //   this.food = newFood;
  //   this.lastFoodRendered = this.renderConfig.foodRenderer(this.food);
  //   if (this.lastFoodRendered) {
  //     this.grid.set(this.food, this.lastFoodRendered);
  //   }
  // }

  // Override setDirection to broadcast direction changes
  public override setDirection(direction: Vector2D) {
    super.setDirection(direction);
    this.onBroadcastUpdate('update_snake', this.playerId, { positions: [...this.snake] });
  }
}