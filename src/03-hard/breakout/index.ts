// Types and constants
interface Brick {
    id: number;
    x: number;
    y: number;
    strength: number;
    points: number;
}

interface PaddlePosition {
    x: number;
    y: number;
}

const PLAYFIELD_WIDTH = 1600;
const PLAYFIELD_HEIGHT = 2400;
const BRICK_WIDTH = 100;
const BRICK_HEIGHT = 30;
const PADDLE_WIDTH = 200;
// PADDLE_HEIGHT is 3, but only the top Y coordinate (paddleY) matters for collision.

// A small value for floating-point comparisons and nudging the ball off surfaces.
// This helps prevent infinite loops due to precision issues when the ball is exactly on a boundary.
const EPSILON = 1e-6; 

// Declare readline and print for CodinGame environment
declare const readline: () => string;
declare const print: (message: string) => void;

// --- Input Parsing ---

// Ball initial position and velocity
let inputs = readline().split(' ').map(Number);
let ballX: number = inputs[0];
let ballY: number = inputs[1];

inputs = readline().split(' ').map(Number);
let ballVX: number = inputs[0];
let ballVY: number = inputs[1];

// Paddle positions
const pN: number = parseInt(readline());
const paddlePositions: PaddlePosition[] = [];
for (let i = 0; i < pN; i++) {
    inputs = readline().split(' ').map(Number);
    paddlePositions.push({ x: inputs[0], y: inputs[1] });
}
let currentPaddleIndex: number = 0;
let paddleX: number = paddlePositions[currentPaddleIndex].x;
let paddleY: number = paddlePositions[currentPaddleIndex].y;

// Bricks
const kN: number = parseInt(readline());
const bricks: Brick[] = [];
for (let i = 0; i < kN; i++) {
    inputs = readline().split(' ').map(Number);
    bricks.push({
        id: i, // Unique ID for each brick (for debugging or more complex logic)
        x: inputs[0],
        y: inputs[1],
        strength: inputs[2],
        points: inputs[3]
    });
}

// --- Game Simulation ---

let totalPoints: number = 0;

// Main simulation loop: continues as long as the ball is within the playfield height
while (ballY < PLAYFIELD_HEIGHT) { 
    let minTime: number = Infinity; // Time until the next collision
    let hitObject: 'wall' | 'paddle' | 'brick' | null = null; // Type of object hit
    let hitSide: 'top' | 'bottom' | 'left' | 'right' | null = null; // Side of the object hit
    let hitBrick: Brick | null = null; // Reference to the specific brick object that was hit

    // 1. Calculate time to hit walls
    // Top wall (Y=0)
    if (ballVY < -EPSILON) { // Ball is moving upwards
        const t = (0 - ballY) / ballVY;
        if (t > EPSILON && t < minTime) { // Must be a future collision
            minTime = t;
            hitObject = 'wall';
            hitSide = 'top';
        }
    }
    // Left wall (X=0)
    if (ballVX < -EPSILON) { // Ball is moving left
        const t = (0 - ballX) / ballVX;
        if (t > EPSILON && t < minTime) {
            minTime = t;
            hitObject = 'wall';
            hitSide = 'left';
        }
    }
    // Right wall (X=PLAYFIELD_WIDTH)
    if (ballVX > EPSILON) { // Ball is moving right
        const t = (PLAYFIELD_WIDTH - ballX) / ballVX;
        if (t > EPSILON && t < minTime) {
            minTime = t;
            hitObject = 'wall';
            hitSide = 'right';
        }
    }

    // 2. Calculate time to hit paddle
    // Only the top of the paddle can be hit (Y=paddleY)
    if (ballVY > EPSILON) { // Ball is moving downwards
        const t = (paddleY - ballY) / ballVY;
        if (t > EPSILON && t < minTime) {
            const hitX = ballX + ballVX * t; // X-coordinate of the ball at potential hit time
            // Check if hit point is within paddle's horizontal extent.
            // Add/subtract EPSILON to handle floating point inaccuracies in comparisons.
            if (hitX >= paddleX - EPSILON && hitX <= paddleX + PADDLE_WIDTH + EPSILON) {
                minTime = t;
                hitObject = 'paddle';
                hitSide = 'top';
            }
        }
    }

    // 3. Calculate time to hit bricks
    for (const brick of bricks) {
        // Skip bricks that have already been broken (strength <= 0)
        if (brick.strength <= 0) continue;

        // Brick top side (Y=brick.y)
        if (ballVY > EPSILON) { // Ball is moving downwards
            const t = (brick.y - ballY) / ballVY;
            if (t > EPSILON && t < minTime) {
                const hitX = ballX + ballVX * t;
                if (hitX >= brick.x - EPSILON && hitX <= brick.x + BRICK_WIDTH + EPSILON) {
                    minTime = t;
                    hitObject = 'brick';
                    hitSide = 'top';
                    hitBrick = brick;
                }
            }
        }
        // Brick bottom side (Y=brick.y + BRICK_HEIGHT)
        if (ballVY < -EPSILON) { // Ball is moving upwards
            const t = (brick.y + BRICK_HEIGHT - ballY) / ballVY;
            if (t > EPSILON && t < minTime) {
                const hitX = ballX + ballVX * t;
                if (hitX >= brick.x - EPSILON && hitX <= brick.x + BRICK_WIDTH + EPSILON) {
                    minTime = t;
                    hitObject = 'brick';
                    hitSide = 'bottom';
                    hitBrick = brick;
                }
            }
        }
        // Brick left side (X=brick.x)
        if (ballVX > EPSILON) { // Ball is moving right
            const t = (brick.x - ballX) / ballVX;
            if (t > EPSILON && t < minTime) {
                const hitY = ballY + ballVY * t;
                if (hitY >= brick.y - EPSILON && hitY <= brick.y + BRICK_HEIGHT + EPSILON) {
                    minTime = t;
                    hitObject = 'brick';
                    hitSide = 'left';
                    hitBrick = brick;
                }
            }
        }
        // Brick right side (X=brick.x + BRICK_WIDTH)
        if (ballVX < -EPSILON) { // Ball is moving left
            const t = (brick.x + BRICK_WIDTH - ballX) / ballVX;
            if (t > EPSILON && t < minTime) {
                const hitY = ballY + ballVY * t;
                if (hitY >= brick.y - EPSILON && hitY <= brick.y + BRICK_HEIGHT + EPSILON) {
                    minTime = t;
                    hitObject = 'brick';
                    hitSide = 'right';
                    hitBrick = brick;
                }
            }
        }
    }

    // Determine if the ball falls off the bottom of the playfield before any other collision
    let timeToBottom: number = Infinity;
    if (ballVY > EPSILON) { // Only if ball is moving downwards
        timeToBottom = (PLAYFIELD_HEIGHT - ballY) / ballVY;
    }

    // If no valid collision was found (minTime remains Infinity) 
    // or if the ball hits the bottom first or simultaneously
    if (minTime === Infinity || minTime >= timeToBottom) {
        ballY = PLAYFIELD_HEIGHT; // Mark ball as lost by setting its Y coordinate beyond the playfield
        break; // Exit the game loop
    }

    // Move the ball to the precise collision point
    ballX += ballVX * minTime;
    ballY += ballVY * minTime;

    // 4. Process the collision and reflect the ball
    if (hitObject === 'wall') {
        if (hitSide === 'top') {
            ballVY = -ballVY;
            ballY = 0 + EPSILON; // Nudge ball off the top wall
        } else if (hitSide === 'left') {
            ballVX = -ballVX;
            ballX = 0 + EPSILON; // Nudge ball off the left wall
        } else if (hitSide === 'right') {
            ballVX = -ballVX;
            ballX = PLAYFIELD_WIDTH - EPSILON; // Nudge ball off the right wall
        }
    } else if (hitObject === 'paddle') {
        ballVY = -ballVY;
        ballY = paddleY - EPSILON; // Nudge ball off the paddle top
        
        // Move the paddle to its next predefined position
        currentPaddleIndex = Math.min(currentPaddleIndex + 1, paddlePositions.length - 1);
        paddleX = paddlePositions[currentPaddleIndex].x;
        paddleY = paddlePositions[currentPaddleIndex].y;
    } else if (hitObject === 'brick' && hitBrick) {
        hitBrick.strength--; // Decrement brick's strength
        if (hitBrick.strength === 0) {
            totalPoints += hitBrick.points; // Add points if brick is broken
            // The brick will automatically be skipped in future iterations because its strength is 0
        }
        
        // Reflect ball based on the side of the brick that was hit
        if (hitSide === 'top') {
            ballVY = -ballVY;
            ballY = hitBrick.y - EPSILON; // Nudge ball off the brick top
        } else if (hitSide === 'bottom') {
            ballVY = -ballVY;
            ballY = hitBrick.y + BRICK_HEIGHT + EPSILON; // Nudge ball off the brick bottom
        } else if (hitSide === 'left') {
            ballVX = -ballVX;
            ballX = hitBrick.x - EPSILON; // Nudge ball off the brick left
        } else if (hitSide === 'right') {
            ballVX = -ballVX;
            ballX = hitBrick.x + BRICK_WIDTH + EPSILON; // Nudge ball off the brick right
        }
    }
}

// --- Output Result ---
print(totalPoints);