import type { DetailedPuzzle, MiniPuzzle, Puzzle } from '../types';

import axios from 'axios';

export class CodinGame {
  static BASE_URL = 'https://www.codingame.com';
  static LEVEL_WEIGHT: Record<string, number> = {
    'tutorial': 0,
    'easy': 1,
    'medium': 2,
    'hard': 3,
    'expert': 4,
    'optim': 10,
    'multi': 20,
    'codegolf-easy': 30,
    'codegolf-medium': 31,
    'codegolf-hard': 32,
    'codegolf-expert': 33,
  };

  request: axios.AxiosInstance;

  constructor(public readonly userId?: number) {
    this.request = axios.create({
      baseURL: CodinGame.BASE_URL,
    });
  }

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
}
