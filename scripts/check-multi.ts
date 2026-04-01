import { readFileSync } from 'node:fs';
import axios from 'axios';

import { CodinGame } from './libs/codingame.js';

const REMEMBER_ME = process.env.REMEMBER_ME!;
const userId = CodinGame.userIdFromRememberMe(REMEMBER_ME);
const PUBLIC_HANDLE = '2f25a8e345ff4b5b1e39653aeb5d84547221051';

const api = axios.create({ baseURL: 'https://www.codingame.com' });

async function main(): Promise<void> {
  // Try the profile multi-training endpoint
  const endpoints = [
    {
      name: 'findCodingamePointsStatsByHandle',
      url: '/services/CodinGamerRemoteService/findCodingamePointsStatsByHandle',
      body: [PUBLIC_HANDLE],
    },
    {
      name: 'findRankingPoints (multi)',
      url: '/services/CodinGamer/findRankingPoints',
      body: [userId],
    },
    {
      name: 'getCodinGamerChallengeRanking (publicHandle)',
      url: '/services/Leaderboards/getCodinGamerChallengeRanking',
      body: [PUBLIC_HANDLE, 'coders-strike-back', 'global'],
    },
    {
      name: 'getCodinGamerChallengeRanking (userId)',
      url: '/services/Leaderboards/getCodinGamerChallengeRanking',
      body: [userId, 'coders-strike-back', 'global'],
    },
    {
      name: 'findGameSessionsByUserId',
      url: '/services/gamesPlayersRankingRemoteService/findLastBattlesByAgentId',
      body: [userId, null],
    },
    {
      name: 'getFilteredPuzzleLeaderboard search pseudo',
      url: '/services/LeaderboardsRemoteService/getFilteredPuzzleLeaderboard',
      body: ['coders-strike-back', null, 'global', { active: false, column: 'PSEUDO', filter: 'Zweer' }],
    },
  ];

  for (const ep of endpoints) {
    try {
      const { data } = await api.post(ep.url, ep.body);
      const str = JSON.stringify(data);
      console.log(`✅ ${ep.name}: ${str.slice(0, 300)}`);
    } catch (e: any) {
      console.log(`❌ ${ep.name}: ${e.response?.status} ${JSON.stringify(e.response?.data)?.slice(0, 200)}`);
    }
  }
}

main();
