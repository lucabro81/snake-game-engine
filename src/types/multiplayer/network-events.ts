import { Vector2D } from "@/types";

export type UpdateType = 'update_snake' | 'snake_updated' | 'food';
export type PayloadType = {
  positions?: Vector2D[];
  food?: Vector2D;
};

export interface NetworkEvents<UpdateType, PayloadType> {
  onPlayerJoined: (playerId: string) => void;
  onPlayerLeft: (playerId: string) => void;
  onReceivedUpdate: (type: UpdateType, playerId: string, payload: PayloadType) => void;
  onBroadcastUpdate: (type: UpdateType, playerId: string, payload: PayloadType) => void;
}