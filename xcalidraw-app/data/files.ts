
import { getClient } from "../api/api-client";
import { MIME_TYPES } from "@xcalidraw/common";
import { decompressData } from "@xcalidraw/xcalidraw/data/encode";
import type { FileId } from "@xcalidraw/element/types";
import type { BinaryFileData, BinaryFileMetadata, DataURL } from "@xcalidraw/xcalidraw/types";

/**
 * Save files to the backend using S3 presigned URLs.
 */
export const saveFilesToBackend = async ({
  boardId,
  files,
}: {
  boardId: string;
  files: { id: FileId; buffer: Uint8Array }[];
}) => {
  const client = getClient();
  const erroredFiles: FileId[] = [];
  const savedFiles: FileId[] = [];

  await Promise.all(
    files.map(async ({ id, buffer }) => {
      try {
        // 1. Get presigned upload URL
        // Content-Type for encrypted/compressed xcalidraw files
        const contentType = "application/octet-stream"; 
        const { data } = await client.getUploadUrl({ boardId }, { fileId: id, contentType });
        
        if (!data.uploadUrl) {
            throw new Error("No upload URL returned");
        }

        // 2. Upload file to S3
        const uploadResponse = await fetch(data.uploadUrl, {
          method: "PUT",
          body: buffer,
          headers: {
            "Content-Type": contentType,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        savedFiles.push(id);
      } catch (error) {
        console.error(`Failed to upload file ${id}:`, error);
        erroredFiles.push(id);
      }
    })
  );

  return { savedFiles, erroredFiles };
};

/**
 * Load files from the backend (S3) and decrypt them.
 */
export const loadFilesFromBackend = async (
  boardId: string,
  decryptionKey: string,
  filesIds: readonly FileId[]
) => {
  const client = getClient();
  const loadedFiles: BinaryFileData[] = [];
  const erroredFiles = new Map<FileId, true>();

  try {
    // 1. Get download URLs for all files
    const { data } = await client.getBatchFileUrls({ boardId }, { fileIds: [...filesIds] });
    
    // 2. Fetch and decrypt each file
    await Promise.all(
        (data.files || []).map(async (fileInfo: any) => {
             const id = fileInfo.id as FileId;
             const url = fileInfo.url;
             
             if (!url) {
                 erroredFiles.set(id, true);
                 return;
             }

             try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Download failed: ${response.statusText}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                
                // 3. Decompress and decrypt
                const { data, metadata } = await decompressData<BinaryFileMetadata>(
                    new Uint8Array(arrayBuffer),
                    {
                      decryptionKey,
                    }
                );
                
                const dataURL = new TextDecoder().decode(data) as DataURL;
                
                loadedFiles.push({
                    mimeType: metadata.mimeType || MIME_TYPES.binary,
                    id,
                    dataURL,
                    created: metadata?.created || Date.now(),
                    lastRetrieved: metadata?.created || Date.now(),
                });

             } catch (error) {
                 console.error(`Failed to load/decrypt file ${id}:`, error);
                 erroredFiles.set(id, true);
             }
        })
    );
  } catch (error: any) {
    console.error("Failed to get batch file URLs:", error?.response?.status || error?.message || error);
    // Mark all as errored if batch request fails
    filesIds.forEach(id => erroredFiles.set(id, true));
  }

  return { loadedFiles, erroredFiles };
};
