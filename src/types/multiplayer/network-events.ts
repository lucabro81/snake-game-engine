export interface NetworkEvents<UpdateType, PayloadType> {
  onPlayerJoined: (playerId: string) => void;
  onPlayerLeft: (playerId: string) => void;
  onReceivedUpdate: (type: UpdateType, playerId: string, payload: PayloadType) => void;
  onBroadcastUpdate: (type: UpdateType, playerId: string, payload: PayloadType) => void;
}