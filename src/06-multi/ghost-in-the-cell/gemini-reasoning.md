The "Ghost in the Cell" puzzle is a turn-based strategy game where players command factories to produce cyborgs and send troops to capture more factories. This solution targets the "Wood 4" league, meaning we are limited to a single action per turn and do not have access to advanced features like bombs or factory upgrades.

## Reasoning

The core objective is to maximize our total cyborg count by capturing neutral factories and eventually opponent factories. Since we can only make one move per turn, the strategy revolves around choosing the single most impactful action.

Here's the breakdown of the strategy:

1.  **Data Representation:**
    *   `Factory` class: Stores `id`, `owner` (1 for me, -1 for opponent, 0 for neutral), current `cyborgs`, and `production` rate.
    *   `Troop` class: Stores `id`, `owner`, `source`, `destination`, `cyborgs`, and `turnsLeft` until arrival.
    *   `distances` matrix: Pre-calculated using Floyd-Warshall algorithm to get the shortest travel time between any two factories. This is crucial for planning attacks.

2.  **Turn Logic:**
    For each turn, the bot aims to find the "best" possible `MOVE` command. If no beneficial move is found, it `WAIT`s. The "best" move is determined by a scoring function that considers multiple factors.

    a.  **Calculating `requiredCyborgs`:**
        Before evaluating a move, we need to know how many cyborgs are required to capture a target factory. This calculation needs to be robust:
        *   **Current Defenders:** Start with the target factory's current `cyborgs`.
        *   **Opponent's Production:** If the target is an opponent's factory, they will produce additional cyborgs while our troop is in transit. We add `targetFactory.production * travelTime` to the defense. Neutral factories do not produce.
        *   **Net Incoming Forces:** We account for all troops (both ours and the opponent's) that are *already en route* to the target factory and will arrive *before or at the same time* as our newly dispatched troop.
            *   My incoming troops reduce the effective defense.
            *   Opponent's incoming troops increase the effective defense.
        *   **One More:** Finally, we add `1` cyborg to ensure capture (attackers must strictly outnumber defenders).
        *   `requiredCyborgs = Math.max(1, currentDefenders + opponentProductionDuringTravel - netIncomingForces + 1)`. The `Math.max(1, ...)` ensures we always target at least one cyborg, even if current calculations suggest the factory is already "cleared" by incoming friendly troops (in which case, we send 1 for reinforcement/consolidation).

    b.  **Scoring a Potential Move (`sourceFactory` to `targetFactory`):**
        A higher score indicates a better move. The scoring function uses a weighted sum of various factors:
        *   **Production Gain:** `+targetFactory.production * 100`: Capturing a factory that produces many cyborgs is highly desirable, so this has a strong positive weight.
        *   **Cyborg Cost:** `-cyborgsToSend * 1.5`: Sending more cyborgs is costly, as it depletes our reserves and potentially weakens the source factory.
        *   **Travel Time (Distance):** `-travelTime * 3`: Longer travel times mean delayed production gain, and also give the opponent more time to react or for the target factory to produce more cyborgs.
        *   **Neutral Factory Bonus:** `+50` if `targetFactory.owner === 0`: Neutral factories are generally easier and safer to capture than opponent factories, so they get a bonus.
        *   **Opponent Factory Penalty:** `-20` if `targetFactory.owner === -1`: Opponent factories are riskier and often require more resources, hence a slight penalty.
        *   **Source Vulnerability Penalty:**
            *   `-100` if `sourceFactory.cyborgs - cyborgsToSend < sourceFactory.production * 2`: This discourages moves that would leave a productive source factory with too few defenders (less than two turns of production).
            *   `-200` if `sourceFactory.production > 0 && sourceFactory.cyborgs - cyborgsToSend < 1`: A very strong penalty to prevent completely emptying a productive factory, as this leaves it extremely vulnerable.

    c.  **Choosing the Best Move:**
        The bot iterates through all its own factories as potential `sourceFactory` and all other factories as potential `targetFactory`. For each valid `(source, target)` pair:
        *   It calculates the `requiredCyborgs`.
        *   It only considers moves where the `sourceFactory` has enough cyborgs to meet the `requiredCyborgs` to guarantee capture (a common strategy for basic bots to avoid wasting troops).
        *   It then calculates the `currentScore` for this move.
        *   The move with the highest `maxScore` is selected.

    d.  **Output:**
        If a `bestMove` is found, the bot outputs a `MOVE` command. Otherwise, it outputs `WAIT`.

This strategy balances expansion (capturing high-production neutral factories) with attacking the opponent and includes basic self-preservation heuristics to avoid leaving factories undefended.

## Code