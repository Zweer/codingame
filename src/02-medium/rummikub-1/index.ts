interface Tile {
    value: number;
    color: string;
}

interface Row {
    id: number;
    type: 'run' | 'set';
    tiles: Tile[];
}

interface GameState {
    table: Map<number, Row>; // Current rows on the table, keyed by rowId
    actions: string[];       // Sequence of actions taken to reach this state
    maxRowId: number;        // Highest rowId ever used, for new split rows
    takenTile: Tile | null;  // The tile currently "in hand" after a TAKE action
    tookFromRowId: number | null; // The rowId from which takenTile was taken (for specific logic if needed)
}