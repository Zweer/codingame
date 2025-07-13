export interface MiniPuzzle {
  id: number;
  level: string;
  validatorScore: number;
  submitted: boolean;
  creationTime: number;
  rank: number;
  solvedCount: number;
  communityCreation: boolean;
}

export interface Topic {
  handle: string;
  category: string;
  value: string;
  children: Topic[];
}
export interface DetailedPuzzle {
  id: number;
  level: string;
  rank: number;
  title: string;
  titleMap: Record<number, string>;
  statement: string;
  validatorScore: number;
  achievementCount: number;
  doneAchievementCount: number;
  linkedAchievements: [];
  contributor: {
    userId: number;
    pseudo: string;
    publicHandle: string;
    enable: boolean;
    avatar: number;
    cover: number;
  };
  solvedCount: number;
  attemptCount: number;
  xpPoints: number;
  feedback: { feedbackId: number; feedbacks: number[] };
  topics: Topic[];
  creationTime: number;
  type: string;
  prettyId: string;
  detailsPageUrl: string;
  replayIds: number[];
  communityCreation: boolean;
}
export type Puzzle = Omit<DetailedPuzzle, 'titleMap' | 'statement' | 'linkedAchievements'>;
