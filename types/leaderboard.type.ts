export interface LeaderboardEntry {
  address: string;
  name?: string;
  profileImage?: string;
  level: number;
  xp: number;
  citizensHoldings: number;
  wearablesHoldings: number;
  isFollowing?: boolean;
}

