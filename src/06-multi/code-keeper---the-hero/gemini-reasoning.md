The goal of this puzzle is to navigate a hero through a maze, fight monsters, collect items, and reach the exit, all while managing the hero's health and weapon charges within a turn limit.

**Core Strategy**

The core strategy revolves around a priority-based decision-making system combined with a limited-visibility map and basic pathfinding.

1.  **Map Management:** The hero only sees a 3-range (Chebyshev distance) area around them. We need to maintain a `GameMap` that stores known obstacles and the locations of visible items and monsters. Unseen areas remain unknown.

2.  **Action Priority:** The hero's actions are prioritized to ensure survival and efficient progress towards the goal:
    *   **1. Immediate Danger (Survival):** If the hero's health is critically low (e.g., less than 5 HP or predicted to drop to 0 or below after monster attacks), prioritize either:
        *   **Attacking:** Identify threatening monsters (those in attack range) and use the most effective weapon to kill them or reduce their damage output. The `Sword` is preferred due to unlimited charges.
        *   **Healing:** If a `Potion` is visible and reachable, prioritize moving to it.
        *   **Fleeing:** If no effective attack or potion is available, try to move to a safer adjacent cell, away from threatening monsters.
    *   **2. Reach Exit:** If the `Exit` is visible and reachable, move towards it. This is the primary win condition.
    *   **3. Sustain (Potions & Charges):** If not in immediate danger, but health isn't full, seek out `Potion`s. If weapon charges are low, seek out `Charge Chest`s (Hammer, Scythe, Bow).
    *   **4. Offensive (Monsters & Treasure):**
        *   Target non-threatening monsters for score, especially weaker ones or those blocking a path. Prioritize `Box`es (1 HP) as they are easy score.
        *   Collect `Treasure`s for score.
    *   **5. Exploration:** If no high-priority targets are visible or reachable, explore the unknown parts of the map to reveal more cells, items, and monsters.

**Technical Details**

*   **Map Representation:**
    *   A 2D boolean array `obstacles` to store permanently known obstacles.
    *   A 2D boolean array `known` to track cells that have been revealed by the hero's vision.
    *   Lists `visibleMonsters` and `visibleItems` are reset and populated each turn based on input.
*   **Pathfinding (BFS):**
    *   A Breadth-First Search (BFS) algorithm (`findClosestTarget` and `findClosestUnknownCell`) is used to determine the shortest *distance* and coordinates of the closest target (Exit, Potion, Charge Chest, Treasure, or unknown cell).
    *   The BFS treats known obstacles and visible monsters as non-walkable cells for general movement. This encourages the hero to explicitly `ATTACK` monsters rather than `MOVE` onto them (which would implicitly use a `Sword`).
    *   Since the game engine handles pathfinding for `MOVE x y`, our BFS mainly determines *which* `x y` to target.
*   **Combat Logic:**
    *   `MONSTER_SPECS` and `WEAPON_SPECS` define properties for entities and weapons.
    *   `getAffectedCells` calculates which cells a specific weapon attack will hit, based on the hero's position and the target cell. This is crucial for correctly implementing Hammer and Scythe's area-of-effect.
    *   When deciding an attack, all possible attack options (weapon-target combinations) are generated. Each option is scored based on:
        *   Number of monsters killed.
        *   Whether it kills a monster that would attack this turn.
        *   Total damage dealt.
        *   Weapon charge cost (Sword is free and thus highly preferred for killing).
    *   The attack with the highest priority score is chosen.

**Implementation Structure**

*   **Enums:** `EntityType`, `WeaponType` for clarity.
*   **Interfaces:** `Point`, `HeroState`, `Entity`, `MonsterSpec`, `AttackOption` for structured data.
*   **`GameMap` Class:** Encapsulates map state, updates based on input, and provides pathfinding utilities.
*   **`decideAction` Function:** Contains the main decision-making logic, implementing the priority system.
*   **Helper Functions:** `isCardinalAdjacent`, `getMonsterSpec`, `isThreatened`, `getAffectedCells` support the main logic.

**Refinements & Considerations:**

*   **Turn Limits:** The 150-turn limit means exploration must be efficient. The BFS to find the closest unknown cell helps with this, guiding the hero towards unrevealed map sections.
*   **Timeouts:** The 50ms per turn constraint means the code must be efficient. BFS on a 16x12 grid is very fast.
*   **`console.error`:** Used for debugging messages, which appear in the CodinGame output but do not affect the game's interaction.

By combining these elements, the bot aims to survive encounters, efficiently collect resources, and ultimately reach the exit.