export interface Achievement {
  id: string;
  puzzleId: number;
  title: string;
  description: string;
  points: number;
  progress: number;
  progressMax: number;
  completionTime: number;
  imageBinaryId: number;
  categoryId: string;
  groupId: string;
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  weight: number;
  unit?: string;
  unlockText?: string;
}

export interface AchievementReport {
  total: number;
  completed: number;
  pending: number;
  totalPoints: number;
  earnedPoints: number;
  byCategory: Record<string, { completed: number; total: number; points: number; earned: number }>;
  byLevel: Record<string, { completed: number; total: number }>;
  achievements: Achievement[];
}
