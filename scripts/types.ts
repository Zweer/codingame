// ---------------------------------------------------------------------------
// Puzzles
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Programming Languages
// ---------------------------------------------------------------------------

export interface LanguageSolveCount {
  programmingLanguageId: string;
  languageName: string;
  logoId: number;
  puzzleCount: number;
}

// ---------------------------------------------------------------------------
// CodinGamer (user profile)
// ---------------------------------------------------------------------------

export interface CodinGamerPublicInfo {
  userId: number;
  pseudo: string;
  countryId: string;
  publicHandle: string;
  formValues: Record<string, string>;
  schoolId?: number;
  avatar?: number;
  company?: string;
  city?: string;
  level: number;
}

export interface RankHistoryEntry {
  rank: number;
  total: number;
  points: number;
  contestPoints: number;
  optimPoints: number;
  codegolfPoints: number;
  multiTrainingPoints: number;
  clashPoints: number;
  date: number;
}

export interface PointsRanking {
  rankHistory: RankHistoryEntry[];
  codingamePointsTotal: number;
  codingamePointsRank: number;
  codingamePointsContests: number;
  codingamePointsAchievements: number;
  codingamePointsXp: number;
  codingamePointsOptim: number;
  codingamePointsCodegolf: number;
  codingamePointsMultiTraining: number;
  codingamePointsClash: number;
  numberCodingamers: number;
  numberCodingamersGlobal: number;
}

export interface PointsStats {
  codingamerPoints: number;
  achievementCount: number;
  codingamer: CodinGamerPublicInfo & {
    rank: number;
    onlineSince: number;
    xp: number;
    category: string;
  };
  codingamePointsRankingDto: PointsRanking;
  xpThresholds: unknown[];
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

export interface Challenge {
  challengeId: number;
  title: string;
  date: number;
  utc: number;
  enable: boolean;
  publicId: string;
  type: string;
  finished: boolean;
  closed: boolean;
  started: boolean;
  visible: boolean;
  training: boolean;
  lateTimeMax: number;
}

// ---------------------------------------------------------------------------
// Game Replays
// ---------------------------------------------------------------------------

export interface ReplayAgent {
  index: number;
  agentId: number;
  score: number;
  valid: boolean;
  codingamer?: {
    userId: number;
    pseudo: string;
    avatar?: number;
  };
  arenaboss?: {
    nickname: string;
    league: {
      divisionIndex: number;
      divisionCount: number;
      divisionOffset: number;
    };
  };
}

export interface ReplayFrame {
  gameInformation: string;
  summary: string;
  view: string;
  stdout: string;
  stderr: string;
  keyframe: boolean;
  agentId: number;
}

export interface GameReplay {
  frames: ReplayFrame[];
  agents: ReplayAgent[];
  scores: number[];
  ranks: number[];
  metadata: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Test Sessions
// ---------------------------------------------------------------------------

export interface TestSessionResult {
  gameId: number;
  frames: ReplayFrame[];
  metadata: Record<string, unknown>;
  scores?: number[];
}

// ---------------------------------------------------------------------------
// Submissions & Reports
// ---------------------------------------------------------------------------

export interface SubmissionReport {
  submissionId: number;
  score: number;
  bestScore: number;
  validators: SubmissionValidator[];
  achievements: unknown[];
}

export interface SubmissionValidator {
  name: string;
  methodName: string;
  success: boolean;
  difficulty: number;
}

export interface SubmissionEntry {
  testSessionQuestionSubmissionId: number;
  programmingLanguageId: string;
  score: number;
  timeElapsed: number;
}
