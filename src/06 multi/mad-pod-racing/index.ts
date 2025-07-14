// Helper classes and functions (to be placed outside the main loop)

/**
 * Represents a 2D point with X and Y coordinates.
 */
class Point {
    constructor(public x: number, public y: number) {}

    /**
     * Calculates the Euclidean distance between this point and another point.
     * @param other The other point.
     * @returns The distance between the two points.
     */
    distance(other: Point): number {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}

/**
 * Represents the player's pod, tracking its position, inferred velocity, and heading angle.
 */
class Pod {
    position: Point;
    velocity: Point; // Inferred velocity per turn (change in position)
    angle: number;   // Angle of the velocity vector in radians

    private prevX: number;
    private prevY: number;

    constructor(x: number, y: number) {
        this.position = new Point(x, y);
        this.velocity = new Point(0, 0);
        this.angle = 0; // Default angle (e.g., for the first turn when velocity is 0)
        this.prevX = x;
        this.prevY = y;
    }

    /**
     * Updates the pod's position and recalculates its velocity and heading angle.
     * @param newX The new X coordinate of the pod.
     * @param newY The new Y coordinate of the pod.
     */
    update(newX: number, newY: number) {
        // Calculate current velocity based on the change from the previous position
        const currentVx = newX - this.prevX;
        const currentVy = newY - this.prevY;

        this.velocity.x = currentVx;
        this.velocity.y = currentVy;
        this.position = new Point(newX, newY);
        this.prevX = newX;
        this.prevY = newY;

        // Update angle only if there's actual movement to avoid NaN from Math.atan2(0,0)
        if (currentVx !== 0 || currentVy !== 0) {
            this.angle = Math.atan2(currentVy, currentVx);
        }
        // If no movement, the angle remains its previous value, or 0 if it's the very first turn.
    }
}

/**
 * Normalizes an angle to the range (-PI, PI].
 * @param angle The angle in radians.
 * @returns The normalized angle.
 */
function normalizeAngle(angle: number): number {
    return (angle + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
}

// --- Global Game State Variables ---
let checkpoints: Point[] = [];
// currentCheckpointIdx: Index of the checkpoint we are *currently* targeting in our `checkpoints` array.
let currentCheckpointIdx: number = 0;
let playerPod: Pod | null = null; // Will be initialized on the first turn

// --- Main Game Loop ---
while (true) {
    // Read input for the current turn
    const inputs = readline().split(' ');
    const x = parseInt(inputs[0]);             // Pod's current X position
    const y = parseInt(inputs[1]);             // Pod's current Y position
    const nextCheckPointX = parseInt(inputs[2]); // X position of the next checkpoint
    const nextCheckPointY = parseInt(inputs[3]); // Y position of the next checkpoint

    // Initialize or update the player's pod state
    if (playerPod === null) {
        playerPod = new Pod(x, y);
    } else {
        playerPod.update(x, y);
    }

    const gameNextCheckPoint = new Point(nextCheckPointX, nextCheckPointY);

    // --- Checkpoint Discovery and Current Target Tracking ---
    // We try to find the `gameNextCheckPoint` in our `checkpoints` array.
    // If found, we update `currentCheckpointIdx` to match its index.
    // If not found, it's a new checkpoint, so we add it and set `currentCheckpointIdx` to its new index.
    let foundCurrentTarget = false;
    for (let i = 0; i < checkpoints.length; i++) {
        if (checkpoints[i].x === gameNextCheckPoint.x && checkpoints[i].y === gameNextCheckPoint.y) {
            currentCheckpointIdx = i; // The game indicates this checkpoint is the next target
            foundCurrentTarget = true;
            break;
        }
    }

    if (!foundCurrentTarget) {
        // This is a new checkpoint we haven't seen before, add it to our track list
        checkpoints.push(gameNextCheckPoint);
        currentCheckpointIdx = checkpoints.length - 1; // It becomes our new target
    }

    const currentTargetCP = checkpoints[currentCheckpointIdx];
    let nextNextCheckpoint: Point | null = null;

    // Determine the next-next checkpoint to plan for future turns
    if (checkpoints.length > 1) {
        // Handle wrap-around for laps (e.g., if current is the last, next-next is the first)
        nextNextCheckpoint = checkpoints[(currentCheckpointIdx + 1) % checkpoints.length];
    }

    // --- Output Variables Initialization ---
    let targetX = currentTargetCP.x;
    let targetY = currentTargetCP.y;
    let thrust = 100; // Default to full thrust

    const distToCurrentCP = playerPod.position.distance(currentTargetCP);

    // Calculate the angle difference between the pod's current heading and the direction to the target checkpoint.
    // This tells us how much the pod needs to turn immediately.
    const angleToTarget = Math.atan2(currentTargetCP.y - playerPod.position.y, currentTargetCP.x - playerPod.position.x);
    const podHeadingAngle = playerPod.angle; // The angle of the pod's velocity vector
    const angleMisalignment = Math.abs(normalizeAngle(angleToTarget - podHeadingAngle)); // How much we need to turn now (0 to PI)

    // --- Thrust Control Logic (Braking Decisions) ---

    // 1. Emergency braking if very close and need a very sharp immediate turn (e.g., > 90 degrees)
    if (distToCurrentCP < 2000 && angleMisalignment > Math.PI / 2) {
        thrust = 0; // Hard brake
    }
    // 2. Strong braking if close and need a significant turn (e.g., > 60 degrees)
    else if (distToCurrentCP < 3000 && angleMisalignment > Math.PI / 3) {
        thrust = 15;
    }
    // 3. Moderate braking if approaching and need some turn (e.g., > 45 degrees)
    else if (distToCurrentCP < 4000 && angleMisalignment > Math.PI / 4) {
        thrust = 40;
    }
    // 4. Ease off slightly if very close to the checkpoint (for precision, regardless of angle)
    else if (distToCurrentCP < 1000) {
        thrust = 80;
    }


    // 5. Pre-emptive braking for sharp *upcoming* turns (using nextNextCheckpoint)
    if (nextNextCheckpoint) {
        // Calculate the angle formed by (Pod's current position -> Current Checkpoint -> Next-Next Checkpoint).
        // This indicates the sharpness of the turn *at* the current checkpoint.
        const vec1x = currentTargetCP.x - playerPod.position.x;
        const vec1y = currentTargetCP.y - playerPod.position.y;
        const vec2x = nextNextCheckpoint.x - currentTargetCP.x;
        const vec2y = nextNextCheckpoint.y - currentTargetCP.y;

        const dotProduct = vec1x * vec2x + vec1y * vec2y;
        const mag1 = Math.sqrt(vec1x * vec1x + vec1y * vec1y);
        const mag2 = Math.sqrt(vec2x * vec2x + vec2y * vec2y);

        let angleAtCheckpoint = Math.PI; // Default to a straight path (180 degrees) if magnitudes are zero or very small
        if (mag1 > 0 && mag2 > 0) {
            angleAtCheckpoint = Math.acos(Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2))));
        }

        const sharpTurnAngleThreshold = Math.PI / 2; // Define a threshold for "sharp turn" (e.g., 90 degrees)
        if (angleAtCheckpoint < sharpTurnAngleThreshold) { // If it's a turn (less than 90 degrees)
            // 'sharpnessFactor' ranges from 0 (very sharp, U-turn) to 1 (90 degrees turn).
            const sharpnessFactor = angleAtCheckpoint / sharpTurnAngleThreshold;

            // Apply more aggressive braking the closer we are AND the sharper the turn.
            if (distToCurrentCP < 3500) { // Start considering braking earlier for sharp turns
                thrust = Math.min(thrust, Math.floor(100 * sharpnessFactor * 0.8)); // Reduce thrust based on sharpness
            }
            if (distToCurrentCP < 1500) { // Closer, even more aggressive reduction
                 thrust = Math.min(thrust, Math.floor(100 * sharpnessFactor * 0.5));
            }
        }

        // --- Predictive Aiming (Corner Cutting Logic) ---
        // Adjust the target point to slightly beyond the current checkpoint, in the direction of the next one.
        // This helps maintain speed and smooth out turns.
        let overshootAmount = 0;
        
        // Overshoot more on straighter segments, less on sharper turns.
        if (angleAtCheckpoint > Math.PI * 0.75) { // Relatively straight path (> 135 degrees)
            overshootAmount = 600;
        } else if (angleAtCheckpoint > Math.PI * 0.5) { // Moderate turn (90-135 degrees)
            overshootAmount = 300;
        } else { // Sharp turn (< 90 degrees) or U-turn
            overshootAmount = 0; // Aim directly at the center for very sharp turns
        }

        // Crucially, don't overshoot if we are currently applying heavy brakes (meaning we need precision).
        if (thrust < 50 && distToCurrentCP < 2000) {
             overshootAmount = 0;
        }
        
        // Apply the overshoot if calculated
        if (overshootAmount > 0) {
            // Vector from current checkpoint to next-next checkpoint
            const cpToNextCpX = nextNextCheckpoint.x - currentTargetCP.x;
            const cpToNextCpY = nextNextCheckpoint.y - currentTargetCP.y;

            const length = Math.sqrt(cpToNextCpX * cpToNextCpX + cpToNextCpY * cpToNextCpY);
            let unitVecX = 0;
            let unitVecY = 0;
            if (length > 0) { // Avoid division by zero for zero-length vectors
                unitVecX = cpToNextCpX / length;
                unitVecY = cpToNextCpY / length;
            }

            targetX = currentTargetCP.x + unitVecX * overshootAmount;
            targetY = currentTargetCP.y + unitVecY * overshootAmount;
        }
    }

    // Ensure final thrust value is always within the allowed range [0, 100]
    thrust = Math.max(0, Math.min(100, thrust));

    // Output the calculated target coordinates and thrust.
    // Coordinates are rounded to the nearest integer as required by the puzzle.
    console.log(`${Math.round(targetX)} ${Math.round(targetY)} ${thrust}`);
}