import React from "react";
import { uploadBytes, ref } from "firebase/storage";
import { nanoid } from "nanoid";

import { trackEvent } from "@xcalidraw/xcalidraw/analytics";
import { Card } from "@xcalidraw/xcalidraw/components/Card";
import { XcalidrawLogo } from "@xcalidraw/xcalidraw/components/XcalidrawLogo";
import { ToolButton } from "@xcalidraw/xcalidraw/components/ToolButton";
import { MIME_TYPES, getFrame } from "@xcalidraw/common";
import {
  encryptData,
  generateEncryptionKey,
} from "@xcalidraw/xcalidraw/data/encryption";
import { serializeAsJSON } from "@xcalidraw/xcalidraw/data/json";
import { isInitializedImageElement } from "@xcalidraw/element";
import { useI18n } from "@xcalidraw/xcalidraw/i18n";

import type {
  FileId,
  NonDeletedXcalidrawElement,
} from "@xcalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@xcalidraw/xcalidraw/types";

import { FILE_UPLOAD_MAX_BYTES } from "../app_constants";
import { encodeFilesForUpload } from "../data/FileManager";
import { loadFirebaseStorage, saveFilesToFirebase } from "../data/firebase";

const PLUS_APP_URL = import.meta.env.VITE_APP_PLUS_APP;

export const exportToXcalidrawPlus = async (
  elements: readonly NonDeletedXcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  name: string,
) => {
  const storage = await loadFirebaseStorage();

  const id = `${nanoid(12)}`;

  const encryptionKey = (await generateEncryptionKey())!;
  const encryptedData = await encryptData(
    encryptionKey,
    serializeAsJSON(elements, appState, files, "database"),
  );

  const blob = new Blob(
    [encryptedData.iv, new Uint8Array(encryptedData.encryptedBuffer)],
    {
      type: MIME_TYPES.binary,
    },
  );

  const storageRef = ref(storage, `/migrations/scenes/${id}`);
  await uploadBytes(storageRef, blob, {
    customMetadata: {
      data: JSON.stringify({ version: 2, name }),
      created: Date.now().toString(),
    },
  });

  const filesMap = new Map<FileId, BinaryFileData>();
  for (const element of elements) {
    if (isInitializedImageElement(element) && files[element.fileId]) {
      filesMap.set(element.fileId, files[element.fileId]);
    }
  }

  if (filesMap.size) {
    const filesToUpload = await encodeFilesForUpload({
      files: filesMap,
      encryptionKey,
      maxBytes: FILE_UPLOAD_MAX_BYTES,
    });

    await saveFilesToFirebase({
      prefix: `/migrations/files/scenes/${id}`,
      files: filesToUpload,
    });
  }

  window.open(`${PLUS_APP_URL}/import?xcalidraw=${id},${encryptionKey}`);
};

export const ExportToXcalidrawPlus: React.FC<{
  elements: readonly NonDeletedXcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  name: string;
  onError: (error: Error) => void;
  onSuccess: () => void;
}> = ({ elements, appState, files, name, onError, onSuccess }) => {
  const { t } = useI18n();
  return (
    <Card color="primary">
      <div className="Card-icon">
        <XcalidrawLogo
          style={{
            [`--color-logo-icon` as any]: "#fff",
            width: "2.8rem",
            height: "2.8rem",
          }}
        />
      </div>
      <h2>Xcalidraw+</h2>
      <div className="Card-details">
        {t("exportDialog.xcalidrawplus_description")}
      </div>
      <ToolButton
        className="Card-button"
        type="button"
        title={t("exportDialog.xcalidrawplus_button")}
        aria-label={t("exportDialog.xcalidrawplus_button")}
        showAriaLabel={true}
        onClick={async () => {
          try {
            trackEvent("export", "eplus", `ui (${getFrame()})`);
            await exportToXcalidrawPlus(elements, appState, files, name);
            onSuccess();
          } catch (error: any) {
            console.error(error);
            if (error.name !== "AbortError") {
              onError(new Error(t("exportDialog.xcalidrawplus_exportError")));
            }
          }
        }}
      />
    </Card>
  );
};
