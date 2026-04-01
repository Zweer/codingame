import { CodinGame } from './libs/codingame.js';

const rm = process.env.REMEMBER_ME!;
const userId = CodinGame.userIdFromRememberMe(rm);
console.log('userId:', userId);

async function main(): Promise<void> {
  const cg = new CodinGame();
  const info = await cg.findCodinGamerPublicInformations(userId);
  console.log('Profile:', JSON.stringify(info, null, 2));

  const stats = await cg.findCodingamePointsStatsByHandle(info.publicHandle);
  console.log('\nmultiTrainingPoints:', stats.codingamePointsRankingDto.codingamePointsMultiTraining);
}

main();
