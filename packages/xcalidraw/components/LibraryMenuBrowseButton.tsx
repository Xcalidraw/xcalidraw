import { VERSIONS } from "@xcalidraw/common";

import { t } from "../i18n";

import type { XcalidrawProps, UIAppState } from "../types";

const LIBRARY_URL = import.meta.env.VITE_APP_LIBRARY_URL;

const LibraryMenuBrowseButton = ({
  theme,
  id,
  libraryReturnUrl,
}: {
  libraryReturnUrl: XcalidrawProps["libraryReturnUrl"];
  theme: UIAppState["theme"];
  id: string;
}) => {
  const referrer =
    libraryReturnUrl || window.location.origin + window.location.pathname;
  return (
    <a
      className="library-menu-browse-button"
      href={`${LIBRARY_URL}?target=${
        window.name || "_blank"
      }&referrer=${referrer}&useHash=true&token=${id}&theme=${theme}&version=${
        VERSIONS.xcalidrawLibrary
      }`}
      target="_xcalidraw_libraries"
    >
      {t("labels.libraries")}
    </a>
  );
};

export default LibraryMenuBrowseButton;
