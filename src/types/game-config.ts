import { ScoreConfig } from "./score-config";

export interface GameConfig {
  width: number;
  height: number;
  tickRate: number;
  continuousSpace: boolean;
  scoreConfig: ScoreConfig;
}