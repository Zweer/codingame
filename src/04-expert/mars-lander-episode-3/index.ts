/**
 * Reads a line from standard input. In CodinGame environment, this maps to `readline()`.
 */
declare function readline(): string;

/**
 * Prints a line to standard output. In CodinGame environment, this maps to `print()`.
 */
declare function print(message: any): void;

type Point = { x: number; y: number };

let surface: Point[] = [];
let landingZone: { startX: number; endX: number; landY: number } | null = null;

const surfaceN: number = parseInt(readline());
for (let i = 0; i < surfaceN; i++) {
    const [landX, landY] = readline().split(' ').map(Number);
    surface.push({ x: landX, y: landY });
}

// Find the unique flat landing zone
for (let i = 0; i < surfaceN - 1; i++) {
    if (surface[i].y === surface[i + 1].y && surface[i + 1].x - surface[i].x >= 1000) {
        landingZone = {
            startX: surface[i].x,
            endX: surface[i + 1].x,
            landY: surface[i].y,
        };
        break;
    }
}

/**
 * Calculates the ground Y coordinate directly beneath the lander's X position using linear interpolation.
 * @param landerX The current X coordinate of the Mars Lander.
 * @param surfacePoints An array of points defining the terrain surface.
 * @returns The Y coordinate of the ground at landerX.
 */
function getGroundY(landerX: number, surfacePoints: Point[]): number {
    for (let i = 0; i < surfacePoints.length - 1; i++) {
        const p1 = surfacePoints[i];
        const p2 = surfacePoints[i + 1];

        // Check if landerX is within the current segment's X range.
        // The condition `landerX < p2.x` is used for all segments except the very last one,
        // where `landerX === p2.x` should also be included to cover the endpoint.
        if (landerX >= p1.x && (landerX < p2.x || (i === surfacePoints.length - 2 && landerX === p2.x))) {
            // Handle vertical segments (should not typically happen for ground, but for robustness)
            if (p1.x === p2.x) { 
                return p1.y;
            }
            // Linear interpolation for Y coordinate
            const slope = (p2.y - p1.y) / (p2.x - p1.x);
            return p1.y + slope * (landerX - p1.x);
        }
    }
    // Fallback: This should ideally not be reached if landerX is always within 0-6999 bounds.
    // If it somehow is, return the Y of the last surface point.
    return surfacePoints[surfacePoints.length - 1].y;
}

// Global constants for control parameters and game rules
const MAX_HSPEED_LANDING = 20; // Maximum allowed horizontal speed for a successful landing
const MAX_VSPEED_LANDING = 40; // Maximum allowed vertical speed for a successful landing
const MAX_ROTATE_CHANGE = 15;  // Maximum change in rotation angle per turn
const MAX_POWER_CHANGE = 1;    // Maximum change in thrust power per turn
const GRAVITY = 3.711;         // Gravity on Mars (m/s^2)

// Game loop: executed once per turn
while (true) {
    // Read current state of the Mars Lander
    const [X, Y, hSpeed, vSpeed, fuel, rotate, power] = readline().split(' ').map(Number);

    let desiredRotate = 0; // The angle to output
    let desiredPower = 0;  // The thrust power to output

    // Calculate important coordinates and distances
    const targetX = (landingZone.startX + landingZone.endX) / 2; // Midpoint of the flat landing zone
    const landY = landingZone.landY;                             // Y-coordinate of the flat landing zone
    const currentGroundY = getGroundY(X, surface);               // Y-coordinate of the ground directly below the lander
    const distToCurrentGround = Y - currentGroundY;              // Altitude above the terrain below the lander
    const distToFlatLandingY = Y - landY;                        // Altitude above the target flat landing Y-coordinate

    // Define altitude thresholds for different control phases
    const criticalAltitude = 150;        // Altitude below which emergency braking is considered
    const landingAltitudeThreshold = 300; // Altitude below which final landing procedures are initiated
    
    // Define horizontal boundaries of the flat landing zone
    const minFlatZoneX = landingZone.startX;
    const maxFlatZoneX = landingZone.endX;

    let targetRotation = 0; // Intermediate variable for desired rotation before clamping
    let targetPower = 0;    // Intermediate variable for desired power before clamping

    // --- Control Logic Based on Phases and Priorities ---

    // 1. Emergency Brake: Prevent immediate crash into any terrain
    // If we are very close to the ground below and falling too fast, prioritize stopping vertical descent.
    if (distToCurrentGround < criticalAltitude && vSpeed < -20) {
        targetRotation = 0; // Straighten up to apply maximum vertical thrust
        targetPower = 4;    // Max thrust
    }
    // 2. High Altitude Horizontal Approach / Braking: Get to the landing zone horizontally
    // This phase is active at higher altitudes or if horizontal speed/position is significantly off.
    else if (Y > landingAltitudeThreshold && (Math.abs(hSpeed) > MAX_HSPEED_LANDING + 5 || X < minFlatZoneX || X > maxFlatZoneX)) {
        
        // Aggressive braking if horizontal speed is very high
        if (hSpeed > MAX_HSPEED_LANDING + 40) { // Very fast moving right
            targetRotation = 90;
        } else if (hSpeed < -(MAX_HSPEED_LANDING + 40)) { // Very fast moving left
            targetRotation = -90;
        }
        // Accelerate towards the flat zone if currently outside and not moving in the right direction fast enough
        else if (X < minFlatZoneX && hSpeed < 10) { // Left of flat zone, need to go right
            targetRotation = -45; 
        } else if (X > maxFlatZoneX && hSpeed > -10) { // Right of flat zone, need to go left
            targetRotation = 45;
        }
        // Moderate braking if still somewhat fast horizontally but not critical
        else if (Math.abs(hSpeed) > MAX_HSPEED_LANDING) { 
            targetRotation = hSpeed > 0 ? 30 : -30;
        } 
        // Fine-tune horizontal position if within acceptable speed but not centered
        else { 
            if (X < targetX - 100) targetRotation = -10;
            else if (X > targetX + 100) targetRotation = 10;
            else targetRotation = 0; // Centered enough
        }
        targetPower = 4; // Always use max power for effective horizontal maneuvers at an angle
    }
    // 3. Final Landing Phase: Execute a soft vertical landing
    // This phase is active when close to the target landing Y, within the flat zone horizontally, and hSpeed is acceptable.
    else if (distToFlatLandingY < landingAltitudeThreshold &&
             X >= minFlatZoneX && X <= maxFlatZoneX &&
             Math.abs(hSpeed) <= MAX_HSPEED_LANDING + 5) { // Allow slight hSpeed buffer for final corrections
        
        targetRotation = 0; // Must be 0 for a safe landing
        
        // Adjust power to control vertical speed for a soft landing
        if (vSpeed < -MAX_VSPEED_LANDING) { // Falling too fast
            targetPower = 4;
        } else if (vSpeed < -20) { // Optimal descent speed range for landing
            targetPower = 3;
        } else if (vSpeed < -10) { // Slightly slow descent, reduce thrust to accelerate downwards
            targetPower = 2;
        } else { // Too slow, rising, or hovering; minimize thrust to fall
            targetPower = 0;
        }
    }
    // 4. General Descent and Fine-Tuning: Default behavior for balancing horizontal and vertical control
    // If not in an emergency, not yet in final landing, and not requiring aggressive horizontal corrections.
    else {
        // Fine-tune horizontal speed: gently brake if there's any significant horizontal movement.
        if (Math.abs(hSpeed) > 5) { 
            targetRotation = hSpeed > 0 ? 10 : -10;
        } else { // If hSpeed is low, try to gently center the lander over targetX.
            if (X < targetX - 50) targetRotation = -5;
            else if (X > targetX + 50) targetRotation = 5;
            else targetRotation = 0; // No horizontal correction needed
        }

        // Adjust vertical thrust:
        // If the lander is angled for horizontal correction, use max power to counteract gravity effectively.
        if (targetRotation !== 0) {
            targetPower = 4; 
        } else {
            // If the lander is vertical, control vertical speed more precisely.
            if (vSpeed < -35) targetPower = 4; // Falling too fast
            else if (vSpeed > -20) targetPower = 0; // Too slow or rising
            else targetPower = 3; // Maintain controlled descent
        }
    }

    // --- Apply Game Constraints (Rotation and Power Limits per Turn) ---

    // Clamp desired rotation angle to +/- 90 degrees absolute limit
    desiredRotate = Math.max(-90, Math.min(90, targetRotation));
    // Limit rotation change per turn to +/- 15 degrees from current rotation
    desiredRotate = Math.max(rotate - MAX_ROTATE_CHANGE, Math.min(rotate + MAX_ROTATE_CHANGE, desiredRotate));

    // Clamp desired thrust power to 0-4 absolute limit
    desiredPower = Math.max(0, Math.min(4, targetPower));
    // Limit power change per turn to +/- 1 from current power
    desiredPower = Math.max(power - MAX_POWER_CHANGE, Math.min(power + MAX_POWER_CHANGE, desiredPower));

    // Output the calculated rotation and power
    console.log(`${desiredRotate} ${desiredPower}`);
}