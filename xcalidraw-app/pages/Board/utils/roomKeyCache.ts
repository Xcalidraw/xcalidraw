/**
 * Room key caching in localStorage.
 * Allows images to load when navigating from dashboard (no hash in URL).
 */

const ROOM_KEY_STORAGE_PREFIX = "xcalidraw_room_key_";

/**
 * Get cached room key for a board.
 */
export const getRoomKey = (boardId: string): string | null => {
  try {
    return localStorage.getItem(ROOM_KEY_STORAGE_PREFIX + boardId);
  } catch (e) {
    console.warn("Failed to retrieve cached room key:", e);
    return null;
  }
};

/**
 * Cache room key for a board.
 */
export const setRoomKey = (boardId: string, key: string): void => {
  try {
    localStorage.setItem(ROOM_KEY_STORAGE_PREFIX + boardId, key);
  } catch (e) {
    console.warn("Failed to cache room key:", e);
  }
};

/**
 * Remove cached room key for a board.
 */
export const removeRoomKey = (boardId: string): void => {
  try {
    localStorage.removeItem(ROOM_KEY_STORAGE_PREFIX + boardId);
  } catch (e) {
    console.warn("Failed to remove cached room key:", e);
  }
};
