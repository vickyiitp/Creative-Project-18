export interface WaveParams {
  frequency: number; // 1 - 20 Hz
  amplitude: number; // 10 - 100 px
  phaseOffset: number;
}

export interface GameState {
  isActive: boolean;
  level: number;
  score: number;
  message: string;
  decodedPercentage: number;
  targetParams: WaveParams;
  playerParams: WaveParams;
  signalLocked: boolean;
}

export enum SignalStatus {
  LOST = 'NO SIGNAL',
  WEAK = 'WEAK SIGNAL',
  STRONG = 'STRONG SIGNAL',
  LOCKED = 'DECRYPTING...',
  DECODED = 'MESSAGE RECEIVED'
}