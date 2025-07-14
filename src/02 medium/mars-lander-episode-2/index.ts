/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

interface Point {
    x: number;
    y: number;
}

// Read the number of points used to draw the surface of Mars.
const surfaceN: number = parseInt(readline());
const surface: Point[] = [];

// Variables to store the flat landing zone coordinates
let flatGroundStartX: number = 0;
let flatGroundEndX: number = 0;
let flatGroundY: number = 0;

// Read surface points and identify the flat ground
for (let i = 0; i < surfaceN; i++) {
    const inputs: string[] = readline().split(' ');
    const landX: number = parseInt(inputs[0]); // X coordinate of a surface point.
    const landY: number = parseInt(inputs[1]); // Y coordinate of a surface point.
    surface.push({ x: landX, y: landY });

    // Check if the current point and the previous one form a flat segment
    if (i > 0 && surface[i - 1].y === landY) {
        flatGroundStartX = surface[i - 1].x;
        flatGroundEndX = landX;
        flatGroundY = landY;
    }
}

// Game loop: runs continuously until the lander lands or crashes
while (true) {
    // Read the current state of the Mars Lander
    const inputs: string[] = readline().split(' ');
    const X: number = parseInt(inputs[0]); // horizontal coordinate (m)
    const Y: number = parseInt(inputs[1]); // vertical coordinate (m)
    const hSpeed: number = parseInt(inputs[2]); // horizontal speed (m/s)
    const vSpeed: number = parseInt(inputs[3]); // vertical speed (m/s)
    const fuel: number = parseInt(inputs[4]); // remaining fuel (liters)
    const rotate: number = parseInt(inputs[5]); // current angle (degrees)
    const power: number = parseInt(inputs[6]); // current thrust power (0-4)

    let newRotate: number = 0; // Desired rotation angle for the next turn
    let newPower: number = 4; // Desired thrust power for the next turn (default to max)

    // Calculate the target X position (center of the flat landing zone)
    const landingTargetX: number = (flatGroundStartX + flatGroundEndX) / 2;
    // Tolerance for horizontal position around target X to consider it "centered"
    const landingToleranceX: number = 100;
    // Altitude threshold below which we prioritize angle 0 for landing
    const criticalLandingAltitude: number = flatGroundY + 150;

    // --- Angle Control (newRotate) ---
    if (Y < criticalLandingAltitude) {
        // If very close to the ground, prioritize a vertical landing angle (0 degrees)
        newRotate = 0;
    } else {
        // If still high up, control horizontal movement and speed
        if (Math.abs(hSpeed) > 20) {
            // If horizontal speed is too high, aggressively brake by tilting
            // Tilt left (positive angle) if moving right, right (negative angle) if moving left
            newRotate = (hSpeed > 0) ? 45 : -45;
        } else if (Math.abs(hSpeed) > 10) {
            // If horizontal speed is moderate, apply a moderate correction
            newRotate = (hSpeed > 0) ? 15 : -15;
        } else {
            // Horizontal speed is low, now fine-tune horizontal position
            if (X < landingTargetX - landingToleranceX) {
                // If too far left, tilt right to move towards the center
                newRotate = -10;
            } else if (X > landingTargetX + landingToleranceX) {
                // If too far right, tilt left to move towards the center
                newRotate = 10;
            } else {
                // Lander is horizontally centered enough, straighten up
                newRotate = 0;
            }
        }
    }

    // Apply angle change rate limit (+/- 15 degrees per turn)
    newRotate = Math.min(rotate + 15, Math.max(rotate - 15, newRotate));
    // Apply absolute angle limits (-90 to 90 degrees)
    newRotate = Math.min(90, Math.max(-90, newRotate));


    // --- Power Control (newPower) ---
    // Default to max power (4) as it generally provides the best control and braking.

    // Scenario 1: Critical vertical speed or too close to the ground.
    // Max power is essential for braking or safe descent regardless of other factors.
    if (vSpeed < -39 || Y < flatGroundY + 100) {
        newPower = 4;
    }
    // Scenario 2: Lander is going up (positive vSpeed).
    // Turn off engines to let gravity pull it down.
    else if (vSpeed > 0) {
        newPower = 0;
    }
    // Scenario 3: High altitude descent optimization.
    // If very high up and not falling fast enough, reduce power for faster descent (fuel/time saving).
    // This assumes horizontal control is already managed (hSpeed is not excessively high).
    else if (Y > flatGroundY + 1000 && vSpeed > -10 && Math.abs(hSpeed) < 30) {
        newPower = 0; // Free fall
    }
    // Scenario 4: Medium altitude descent optimization.
    // If at medium height and vertical speed is still too slow, reduce power moderately.
    else if (Y > flatGroundY + 400 && vSpeed > -20 && Math.abs(hSpeed) < 20) {
        newPower = 2; // Reduced power to accelerate descent
    }
    // In all other cases (e.g., maintaining controlled descent,
    // or when horizontal speed needs significant braking and thus max thrust is needed overall),
    // keep power at 4 or 3. Here, defaulting to 4 to err on the side of safety.
    else if (vSpeed < -10) { // If descending at a reasonable speed but not critical
        newPower = 4; // Use max power to slowly decelerate or maintain control
    } else { // If vSpeed is close to 0 or slightly negative, and not high up for free fall
        newPower = 3; // Maintain power to counteract gravity and allow very slow descent
    }

    // Apply power change rate limit (+/- 1 per turn)
    newPower = Math.min(power + 1, Math.max(power - 1, newPower));
    // Apply absolute power limits (0 to 4)
    newPower = Math.min(4, Math.max(0, newPower));

    // Output the desired rotation angle and thrust power
    console.log(`${newRotate} ${newPower}`);
}