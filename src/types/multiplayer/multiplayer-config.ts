import { GameConfig } from "../game-config";

export interface MultiplayerConfig extends GameConfig {
  playerId: string;
  isHost: boolean;
}