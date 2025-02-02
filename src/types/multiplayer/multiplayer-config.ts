import { GameConfig } from "../game-config";
import type { NetworkEvents, PayloadType, UpdateType } from "./network-events";

export interface MultiplayerConfig extends GameConfig {
  playerId: string;
  isHost: boolean;
  networkEvents?: NetworkEvents<UpdateType, PayloadType>;
}