declare function readline(): string;

class Game {
  static STRIKE_DISTANCE = 4;

  private thorX: number;
  private thorY: number;

  constructor() {
    [this.thorX, this.thorY] = readline().split(' ').map(Number);

    console.error(`Thor's initial position: (${this.thorX}, ${this.thorY})`);
  }

  initTurn(): { hammerStrikes: number; giants: { x: number; y: number }[] } {
    const [hammerStrikes, numGiants] = readline().split(' ').map(Number);

    const giants: { x: number; y: number }[] = [];
    for (let i = 0; i < numGiants; i++) {
      const [x, y] = readline().split(' ').map(Number);
      giants.push({ x, y });
    }

    return { hammerStrikes, giants };
  }

  turn(hammerStrikes: number, giants: { x: number; y: number }[]): void {
    // 1. Generate all possible actions and evaluate their safety.
    const possibleActions = ['STRIKE', 'WAIT', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const safeActions: string[] = [];

    for (const action of possibleActions) {
      let nextThorX = this.thorX;
      let nextThorY = this.thorY;
      const isMove = action !== 'STRIKE' && action !== 'WAIT';

      if (isMove) {
        if (action.includes('N'))
          nextThorY--;
        if (action.includes('S'))
          nextThorY++;
        if (action.includes('E'))
          nextThorX++;
        if (action.includes('W'))
          nextThorX--;
      }

      // Check if the move is within map boundaries.
      if (nextThorX < 0 || nextThorX >= 40 || nextThorY < 0 || nextThorY >= 18) {
        continue; // Illegal action.
      }

      // An action is safe if no giant will land on Thor's next tile.
      let actionIsSafe = true;
      for (const giant of giants) {
        // If we strike, will this giant die? If so, it's no longer a threat for this action.
        const giantDies
          = action === 'STRIKE'
            && hammerStrikes > 0
            && Math.max(Math.abs(this.thorX - giant.x), Math.abs(this.thorY - giant.y))
            <= Game.STRIKE_DISTANCE;

        if (giantDies) {
          continue;
        }

        // Predict giant's next position based on Thor's potential next position.
        const nextGiantX = giant.x + Math.sign(nextThorX - giant.x);
        const nextGiantY = giant.y + Math.sign(nextThorY - giant.y);

        if (nextThorX === nextGiantX && nextThorY === nextGiantY) {
          actionIsSafe = false; // Collision detected!
          break;
        }
      }

      if (actionIsSafe) {
        safeActions.push(action);
      }
    }

    // 2. From the safe actions, choose the best one based on a clear hierarchy.
    let bestAction: string;

    const allGiantsInRange
      = giants.length > 0
        && giants.every(
          giant =>
            Math.max(Math.abs(this.thorX - giant.x), Math.abs(this.thorY - giant.y))
            <= Game.STRIKE_DISTANCE,
        );

    // Priority 1: Perfect offensive strike.
    if (safeActions.includes('STRIKE') && allGiantsInRange && hammerStrikes > 0) {
      bestAction = 'STRIKE';
    } else {
      const safeMoves = safeActions.filter(action => action !== 'STRIKE');

      if (safeMoves.length > 0) {
        // Priority 2: Strategic move. Find the best safe move.
        bestAction = 'WAIT'; // Default if no giants.
        if (giants.length > 0) {
          let minDistance = Infinity;

          // Default target is the center of mass.
          let targetX = giants.reduce((sum, giant) => sum + giant.x, 0) / giants.length;
          let targetY = giants.reduce((sum, giant) => sum + giant.y, 0) / giants.length;

          // Herding logic for aligned giants
          if (giants.length > 2) {
            const minX = Math.min(...giants.map(giant => giant.x));
            const maxX = Math.max(...giants.map(giant => giant.x));
            const minY = Math.min(...giants.map(giant => giant.y));
            const maxY = Math.max(...giants.map(giant => giant.y));
            const width = maxX - minX;
            const height = maxY - minY;

            const alignmentRation = 2.5;
            const herdOffset = 4;

            if (width > alignmentRation * height) {
              // Horizontally aligned: Herd them vertically.
              console.error('Herding horizontal line of giants');
              targetY += this.thorY < targetY ? -herdOffset : herdOffset;
            } else if (height > alignmentRation * width) {
              // Vertically aligned: Herd them horizontally.
              console.error('Herding vertical line of giants');
              targetX += this.thorX < targetX ? -herdOffset : herdOffset;
            }
          }

          for (const move of safeMoves) {
            let nextThorX = this.thorX;
            let nextThorY = this.thorY;
            if (move.includes('N'))
              nextThorY--;
            if (move.includes('S'))
              nextThorY++;
            if (move.includes('E'))
              nextThorX++;
            if (move.includes('W'))
              nextThorX--;

            const dist = (nextThorX - targetX) ** 2 + (nextThorY - targetY) ** 2;

            if (dist < minDistance) {
              minDistance = dist;
              bestAction = move;
            }
          }
        }
      } else if (safeActions.includes('STRIKE') && hammerStrikes > 0 && giants.length > 0) {
        // Priority 3: Forced defensive strike. No safe moves exist.
        bestAction = 'STRIKE';
      } else {
        // Trapped and no strikes, or STRIKE is not even safe.
        bestAction = 'WAIT';
      }
    }

    // 3. Execute the chosen action.
    console.log(bestAction);

    // 4. Update Thor's position for the next turn.
    if (bestAction !== 'STRIKE' && bestAction !== 'WAIT') {
      if (bestAction.includes('N'))
        this.thorY--;
      if (bestAction.includes('S'))
        this.thorY++;
      if (bestAction.includes('E'))
        this.thorX++;
      if (bestAction.includes('W'))
        this.thorX--;
    }
  }
}

const game = new Game();
while (true) {
  const { hammerStrikes, giants } = game.initTurn();
  game.turn(hammerStrikes, giants);
}
