/**
 * Functions for starting and managing collaboration.
 * Handles: always-on collaboration setup, key derivation.
 */

import { isCollaborationLink } from "../../../data";
import { deriveKeyFromBoardId } from "../utils/deriveKey";
import type { CollabAPI } from "../../../collab/Collab";

interface StartCollabOpts {
  boardId: string;
  collabAPI: CollabAPI;
  isCollabDisabled: boolean;
}

/**
 * Start always-on collaboration for a board.
 * Uses boardId as roomId and derives roomKey from boardId.
 */
export const startAlwaysOnCollab = async (opts: StartCollabOpts): Promise<void> => {
  const { boardId, collabAPI, isCollabDisabled } = opts;

  if (
    boardId &&
    collabAPI &&
    !collabAPI.isCollaborating() &&
    !isCollabDisabled &&
    !isCollaborationLink(window.location.href) // Don't interfere with existing room links
  ) {
    // Derive a valid encryption key from boardId
    const roomKey = await deriveKeyFromBoardId(boardId);
    
    // Use boardId as the room ID for always-on collaboration
    collabAPI.startCollaboration(
      {
        roomId: boardId,
        roomKey, // Properly derived AES-128 key
      },
      { skipSceneReset: true } // Don't reset scene since board data is already loaded
    );
  }
};
