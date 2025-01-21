import { Vector2D } from "../vector-2D";

export interface NetworkEvents {
  onPlayerJoined?: (playerId: string) => void;
  onPlayerLeft?: (playerId: string) => void;
  onSnakeUpdate?: (playerId: string, positions: Vector2D[]) => void;
  onFoodUpdate?: (food: Vector2D) => void;
  broadcastSnakeUpdate?: (playerId: string, positions: Vector2D[]) => void;
  broadcastFoodUpdate?: (food: Vector2D) => void;
}