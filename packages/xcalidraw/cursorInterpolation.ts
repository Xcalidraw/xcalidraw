/**
 * Cursor Interpolation Utility - Spring Physics Based
 * 
 * Uses spring physics for smooth, natural cursor movement like Miro.
 * Creates a trailing effect where cursor "follows" the target smoothly.
 */

interface InterpolatedPosition {
  // Target position (where cursor should end up)
  targetX: number;
  targetY: number;
  // Current interpolated position (rendered position)
  currentX: number;
  currentY: number;
  // Velocity for spring physics
  velocityX: number;
  velocityY: number;
  // Timestamp of last update
  lastUpdate: number;
}

// Store interpolated positions per socket
const interpolatedPositions = new Map<string, InterpolatedPosition>();

// Spring physics constants - adjust these for feel
const SPRING_DAMPING = 0.7;     // How quickly oscillation stops (0.5-0.9, higher = less bouncy)
const SPRING_STIFFNESS = 0.08; // How hard spring pulls (0.05-0.2, lower = smoother trail)

// How long before we snap to target (ms)
const SNAP_THRESHOLD = 500;

/**
 * Spring-based interpolation for natural movement
 */
function springInterpolate(
  current: number,
  target: number,
  velocity: number,
): { position: number; velocity: number } {
  const distance = target - current;
  const springForce = distance * SPRING_STIFFNESS;
  const dampingForce = velocity * SPRING_DAMPING;
  const acceleration = springForce - dampingForce;
  
  const newVelocity = velocity + acceleration;
  const newPosition = current + newVelocity;
  
  return { position: newPosition, velocity: newVelocity };
}

/**
 * Update the target position for a socket and return interpolated position
 */
export function updateCursorPosition(
  socketId: string,
  targetX: number,
  targetY: number,
): { x: number; y: number } {
  const now = Date.now();
  const existing = interpolatedPositions.get(socketId);

  if (!existing) {
    // First time seeing this cursor - snap to position
    interpolatedPositions.set(socketId, {
      targetX,
      targetY,
      currentX: targetX,
      currentY: targetY,
      velocityX: 0,
      velocityY: 0,
      lastUpdate: now,
    });
    return { x: targetX, y: targetY };
  }

  // Update target position
  existing.targetX = targetX;
  existing.targetY = targetY;
  existing.lastUpdate = now;

  return { x: existing.currentX, y: existing.currentY };
}

/**
 * Advance all cursor interpolations by one frame
 * Call this in the animation loop
 */
export function advanceCursorInterpolation(): void {
  const now = Date.now();

  interpolatedPositions.forEach((pos, socketId) => {
    const timeSinceUpdate = now - pos.lastUpdate;

    if (timeSinceUpdate > SNAP_THRESHOLD) {
      // Cursor hasn't moved in a while, snap to target
      pos.currentX = pos.targetX;
      pos.currentY = pos.targetY;
      pos.velocityX = 0;
      pos.velocityY = 0;
    } else {
      // Apply spring physics for smooth trailing effect
      const resultX = springInterpolate(pos.currentX, pos.targetX, pos.velocityX);
      const resultY = springInterpolate(pos.currentY, pos.targetY, pos.velocityY);
      
      pos.currentX = resultX.position;
      pos.velocityX = resultX.velocity;
      pos.currentY = resultY.position;
      pos.velocityY = resultY.velocity;
      
      // Snap if very close to target (prevent micro-jitter)
      if (Math.abs(pos.targetX - pos.currentX) < 0.5 && Math.abs(pos.velocityX) < 0.1) {
        pos.currentX = pos.targetX;
        pos.velocityX = 0;
      }
      if (Math.abs(pos.targetY - pos.currentY) < 0.5 && Math.abs(pos.velocityY) < 0.1) {
        pos.currentY = pos.targetY;
        pos.velocityY = 0;
      }
    }
  });
}

/**
 * Get the current interpolated position for a socket
 */
export function getInterpolatedPosition(
  socketId: string,
): { x: number; y: number } | null {
  const pos = interpolatedPositions.get(socketId);
  if (!pos) return null;

  return { x: pos.currentX, y: pos.currentY };
}

/**
 * Remove a cursor from interpolation tracking
 */
export function removeCursor(socketId: string): void {
  interpolatedPositions.delete(socketId);
}

/**
 * Clear all tracked cursors
 */
export function clearAllCursors(): void {
  interpolatedPositions.clear();
}
