import axios from 'axios';

import type { Achievement } from '../types-achievements.js';
import type {
  Challenge,
  CodinGamerPublicInfo,
  DetailedPuzzle,
  GameReplay,
  LanguageSolveCount,
  MiniPuzzle,
  PointsStats,
  Puzzle,
  TestSessionResult,
} from '../types.js';

export class CodinGame {
  static BASE_URL = 'https://www.codingame.com';

  static LEVEL_WEIGHT: Record<string, number> = {
    tutorial: 0,
    easy: 1,
    medium: 2,
    hard: 3,
    expert: 4,
    optim: 10,
    multi: 20,
    'codegolf-easy': 30,
    'codegolf-medium': 31,
    'codegolf-hard': 32,
    'codegolf-expert': 33,
  };

  static LEVEL_DIR: Record<string, string> = {
    tutorial: '00-tutorial',
    easy: '01-easy',
    medium: '02-medium',
    hard: '03-hard',
    expert: '04-expert',
    optim: '05-optim',
    multi: '06-multi',
    'codegolf-easy': '07-codegolf-easy',
    'codegolf-medium': '08-codegolf-medium',
    'codegolf-hard': '09-codegolf-hard',
    'codegolf-expert': '10-codegolf-expert',
  };

  static ALL_LANGUAGES = [
    'Bash',
    'C',
    'C#',
    'C++',
    'Clojure',
    'D',
    'Dart',
    'F#',
    'Go',
    'Groovy',
    'Haskell',
    'Java',
    'Javascript',
    'Kotlin',
    'Lua',
    'ObjectiveC',
    'OCaml',
    'Pascal',
    'Perl',
    'PHP',
    'Python3',
    'Ruby',
    'Rust',
    'Scala',
    'Swift',
    'TypeScript',
    'VB.NET',
  ] as const;

  request: axios.AxiosInstance;

  constructor(public readonly userId?: number) {
    this.request = axios.create({ baseURL: CodinGame.BASE_URL });
  }

  /** Extract userId from the rememberMe cookie (first 7 chars). */
  static userIdFromRememberMe(cookie: string): number {
    return Number.parseInt(cookie.slice(0, 7), 10);
  }

  // ---------------------------------------------------------------------------
  // Puzzles
  // ---------------------------------------------------------------------------

  async findAllMinimalProgress(): Promise<MiniPuzzle[]> {
    const { data } = await this.request.post<MiniPuzzle[]>(
      '/services/Puzzle/findAllMinimalProgress',
      [this.userId],
    );
    return data;
  }

  async findProgressByIds(ids: number[]): Promise<Puzzle[]> {
    const { data } = await this.request.post<Puzzle[]>('/services/Puzzle/findProgressByIds', [
      ids,
      this.userId,
      2,
    ]);
    return data;
  }

  async findProgressByPrettyId(prettyId: string): Promise<DetailedPuzzle> {
    const { data } = await this.request.post<DetailedPuzzle>(
      '/services/Puzzle/findProgressByPrettyId',
      [prettyId, this.userId],
    );
    return data;
  }

  /** Count of puzzles solved per programming language for a user. */
  async countSolvedPuzzlesByProgrammingLanguage(
    userId?: number,
  ): Promise<LanguageSolveCount[]> {
    const { data } = await this.request.post<LanguageSolveCount[]>(
      '/services/Puzzle/countSolvedPuzzlesByProgrammingLanguage',
      [userId ?? this.userId],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Achievements
  // ---------------------------------------------------------------------------

  /** All achievements with progress for a given user (0 = anonymous). */
  async findAchievements(userId?: number): Promise<Achievement[]> {
    const { data } = await this.request.post<Achievement[]>(
      '/services/Achievement/findByCodingamerId',
      [userId ?? this.userId ?? 0],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // CodinGamer (user profile)
  // ---------------------------------------------------------------------------

  async findCodinGamerPublicInformations(userId?: number): Promise<CodinGamerPublicInfo> {
    const { data } = await this.request.post<CodinGamerPublicInfo>(
      '/services/CodinGamer/findCodinGamerPublicInformations',
      [userId ?? this.userId],
    );
    return data;
  }

  /** Full points stats including rank history. Requires publicHandle. */
  async findCodingamePointsStatsByHandle(publicHandle: string): Promise<PointsStats> {
    const { data } = await this.request.post<PointsStats>(
      '/services/CodinGamerRemoteService/findCodingamePointsStatsByHandle',
      [publicHandle],
    );
    return data;
  }

  async findFollowerIds(userId?: number): Promise<number[]> {
    const { data } = await this.request.post<number[]>('/services/CodinGamer/findFollowerIds', [
      userId ?? this.userId,
    ]);
    return data;
  }

  async findFollowingIds(userId?: number): Promise<number[]> {
    const { data } = await this.request.post<number[]>('/services/CodinGamer/findFollowingIds', [
      userId ?? this.userId,
    ]);
    return data;
  }

  /** Console info: recent challenges and puzzle activity. */
  async getMyConsoleInformation(
    userId?: number,
  ): Promise<{ challenges: unknown[]; puzzles: unknown[] }> {
    const { data } = await this.request.post<{ challenges: unknown[]; puzzles: unknown[] }>(
      '/services/CodinGamer/getMyConsoleInformation',
      [userId ?? this.userId],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Challenges
  // ---------------------------------------------------------------------------

  async findAllChallenges(): Promise<Challenge[]> {
    const { data } = await this.request.post<Challenge[]>(
      '/services/Challenge/findAllChallenges',
      [],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Clash of Code
  // ---------------------------------------------------------------------------

  async findPendingClashes(): Promise<unknown[]> {
    const { data } = await this.request.post<unknown[]>(
      '/services/ClashOfCode/findPendingClashes',
      [],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Programming Languages
  // ---------------------------------------------------------------------------

  async findAllLanguageIds(): Promise<string[]> {
    const { data } = await this.request.post<string[]>(
      '/services/ProgrammingLanguage/findAllIds',
      [],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Game Replays
  // ---------------------------------------------------------------------------

  /** Fetch full replay data for a game by its ID (from share-replay URL). */
  async findReplayByGameId(gameId: string): Promise<GameReplay> {
    const { data } = await this.request.post<GameReplay>(
      '/services/gameResult/findByGameId',
      [gameId, null],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Test Sessions (submit solutions programmatically)
  // ---------------------------------------------------------------------------

  /** Create a test session for a puzzle. Returns a session handle. */
  async createTestSession(prettyId: string): Promise<string> {
    const { data } = await this.request.post<{ handle: string }>(
      '/services/Puzzle/generateSessionFromPuzzlePrettyId',
      [this.userId, prettyId, false],
    );
    return data.handle;
  }

  /**
   * Submit code to a test session. Returns the full replay data.
   * @param handle - Session handle from createTestSession
   * @param code - Source code to submit
   * @param language - Programming language ID (e.g. 'PHP', 'Rust', 'Python3')
   * @param testIndex - Test case index (default 1)
   */
  async play(
    handle: string,
    code: string,
    language: string,
    testIndex = 1,
  ): Promise<TestSessionResult> {
    const { data } = await this.request.post<TestSessionResult>(
      '/services/TestSession/play',
      [handle, { code, programmingLanguageId: language, multipleLanguages: { testIndex } }],
    );
    return data;
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  /** Set the rememberMe cookie for authenticated requests. */
  setRememberMe(cookie: string): void {
    this.request.defaults.headers.common['Cookie'] = `rememberMe=${cookie}`;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Fetch all puzzles (mini + full details). */
  async fetchAllPuzzles(): Promise<Puzzle[]> {
    const mini = await this.findAllMinimalProgress();
    return this.findProgressByIds(mini.map((p) => p.id));
  }
}
