/**
 * Derives a valid AES-128 encryption key from a boardId.
 * This is used for always-on collaboration where we need a deterministic key
 * based on the board ID, rather than generating random keys.
 */
export const deriveKeyFromBoardId = async (boardId: string): Promise<string> => {
  // Use SHA-256 to hash the boardId, then take first 16 bytes (128 bits)
  const encoder = new TextEncoder();
  const data = encoder.encode(boardId + "_xcalidraw_collab_key");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Take first 16 bytes (128 bits for AES-128)
  const keyBytes = new Uint8Array(hashBuffer.slice(0, 16));
  
  // Import as a proper CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 128 },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  
  // Export as JWK and return the 'k' property (this matches generateEncryptionKey format)
  const jwk = await crypto.subtle.exportKey("jwk", cryptoKey);
  return jwk.k!;
};
