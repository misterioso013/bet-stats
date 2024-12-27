export type Color = 'red' | 'black' | 'white';

export interface Pattern {
  color: Color;
  position: number;
}

export interface BetConfig {
  initialAmount: number;
  martingale: number;
  targetColor: Color;
}

export interface Stats {
  wins: number;
  losses: number;
  currentLossStreak: number;
  totalMartingales: number;
  profit: number;
  totalBets: number;
  highestStreak: {
    wins: number;
    losses: number;
  };
}

export interface Strategy {
  id: string;
  name: string;
  pattern: Pattern[];
  active: boolean;
  createdAt: Date;
  betConfig: BetConfig;
  stats: Stats;
}

export default Strategy; 