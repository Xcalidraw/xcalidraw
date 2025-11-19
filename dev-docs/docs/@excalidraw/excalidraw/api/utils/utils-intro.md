---
slug: /@xcalidraw/xcalidraw/api/utils
---

# Utils

These are pure Javascript functions exported from the @xcalidraw/xcalidraw [`@xcalidraw/xcalidraw`](https://npmjs.com/@xcalidraw/xcalidraw). If you want to export your drawings in different formats eg `png`, `svg` and more you can check out [Export Utilities](/docs/@xcalidraw/xcalidraw/API/utils/export). If you want to restore your drawings you can check out [Restore Utilities](/docs/@xcalidraw/xcalidraw/API/utils/restore).

### serializeAsJSON

Takes the scene elements and state and returns a JSON string. `Deleted` elements as well as most properties from `AppState` are removed from the resulting JSON. (see [`serializeAsJSON()`](https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/data/json.ts#L42) source for details).

If you want to overwrite the `source` field in the `JSON` string, you can set `window.XCALIDRAW_EXPORT_SOURCE` to the desired value.

**_Signature_**

<pre>
serializeAsJSON(&#123;<br/>&nbsp;
  elements: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L114">XcalidrawElement[]</a>,<br/>&nbsp;
  appState: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L95">AppState</a>,<br/>
}): string
</pre>

**How to use**

```js
import { serializeAsJSON } from "@xcalidraw/xcalidraw";
```

### serializeLibraryAsJSON

Takes the `library` items and returns a `JSON` string.

If you want to overwrite the source field in the JSON string, you can set `window.XCALIDRAW_EXPORT_SOURCE` to the desired value.

**_Signature_**

<pre>
serializeLibraryAsJSON(
  libraryItems: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L200">LibraryItems[]</a>)
</pre>

**How to use**

```js
import { serializeLibraryAsJSON } from "@xcalidraw/xcalidraw";
```

#### isInvisiblySmallElement

Returns `true` if element is invisibly small (e.g. width & height are zero).

**_Signature_**

<pre>
isInvisiblySmallElement(element:  <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L114">XcalidrawElement</a>): boolean
</pre>

**How to use**

```js
import { isInvisiblySmallElement } from "@xcalidraw/xcalidraw";
```

### loadFromBlob

This function loads the scene data from the blob (or file). If you pass `localAppState`, `localAppState` value will be preferred over the `appState` derived from `blob`. Throws if blob doesn't contain valid scene data.

**How to use**

```js
import { loadFromBlob } from "@xcalidraw/xcalidraw";

const scene = await loadFromBlob(file, null, null);
xcalidrawAPI.updateScene(scene);
```

**Signature**

<pre>
loadFromBlob(<br/>&nbsp;
  blob: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">Blob</a>,<br/>&nbsp;
  localAppState: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L95">AppState</a> | null,<br/>&nbsp;
  localElements: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L114">XcalidrawElement[]</a> | null,<br/>&nbsp;
  fileHandle?: FileSystemHandle | null <br/>
) => Promise&lt;<a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/data/restore.ts#L61">RestoredDataState</a>>
</pre>

### loadLibraryFromBlob

This function loads the library from the blob. Additonally takes `defaultStatus` param which sets the default status for library item if not present, defaults to `unpublished`.

**How to use **

```js
import { loadLibraryFromBlob } from "@xcalidraw/xcalidraw";
```

**_Signature_**

<pre>
loadLibraryFromBlob(blob: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">Blob</a>, defaultStatus: "published" | "unpublished")
</pre>

### loadSceneOrLibraryFromBlob

This function loads either scene or library data from the supplied blob. If the blob contains scene data, and you pass `localAppState`, `localAppState` value will be preferred over the `appState` derived from `blob`.

:::caution

Throws if blob doesn't contain valid `scene` data or `library` data.

:::

**How to use**

```js showLineNumbers
import { loadSceneOrLibraryFromBlob, MIME_TYPES } from "@xcalidraw/xcalidraw";

const contents = await loadSceneOrLibraryFromBlob(file, null, null);
if (contents.type === MIME_TYPES.xcalidraw) {
  xcalidrawAPI.updateScene(contents.data);
} else if (contents.type === MIME_TYPES.xcalidrawlib) {
  xcalidrawAPI.updateLibrary(contents.data);
}
```

**_Signature_**

<pre>
loadSceneOrLibraryFromBlob(<br/>&nbsp;
  blob: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">Blob</a>,<br/>&nbsp;
  localAppState: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L95">AppState</a> | null,<br/>&nbsp;
  localElements: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L114">XcalidrawElement[]</a> | null,<br/>&nbsp;
  fileHandle?: FileSystemHandle | null<br/>
) => Promise&lt;&#123; type: string, data: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/data/restore.ts#L53">RestoredDataState</a> | <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/data/types.ts#L33">ImportedLibraryState</a>}>
</pre>

### getFreeDrawSvgPath

This function returns the `free draw` svg path for the element.

**How to use**

```js
import { getFreeDrawSvgPath } from "@xcalidraw/xcalidraw";
```

**Signature**

<pre>
getFreeDrawSvgPath(element: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L182">XcalidrawFreeDrawElement</a>)
</pre>

### isLinearElement

This function returns true if the element is `linear` type (`arrow` |`line`) else returns `false`.

**How to use**

```js
import { isLinearElement } from "@xcalidraw/xcalidraw";
```

**Signature**

<pre>
isLinearElement(elementType?: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L80">XcalidrawElement</a>): boolean
</pre>

### getNonDeletedElements

This function returns an array of `deleted` elements.

**How to use**

```js
import { getNonDeletedElements } from "@xcalidraw/xcalidraw";
```

**Signature**

<pre>
getNonDeletedElements(elements:<a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L114"> readonly XcalidrawElement[]</a>): as readonly <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L125">NonDeletedXcalidrawElement[]</a>
</pre>

### mergeLibraryItems

This function merges two `LibraryItems` arrays, where unique items from `otherItems` are sorted first in the returned array.

```js
import { mergeLibraryItems } from "@xcalidraw/xcalidraw";
```

**_Signature_**

<pre>
mergeLibraryItems(<br/>&nbsp;
  localItems: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L250">LibraryItems</a>,<br/>&nbsp;
  otherItems: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L200">LibraryItems</a><br/>
): <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L250">LibraryItems</a>
</pre>

### parseLibraryTokensFromUrl

Parses library parameters from URL if present (expects the `#addLibrary` hash key), and returns an object with the `libraryUrl` and `idToken`. Returns `null` if `#addLibrary` hash key not found.

**How to use**

```js
import { parseLibraryTokensFromUrl } from "@xcalidraw/xcalidraw";
```

**Signature**

```tsx
parseLibraryTokensFromUrl(): {
    libraryUrl: string;
    idToken: string | null;
} | null
```

### useHandleLibrary

A hook that automatically imports library from url if `#addLibrary` hash key exists on initial load, or when it changes during the editing session (e.g. when a user installs a new library), and handles initial library load if `getInitialLibraryItems` getter is supplied.

**How to use**

```js
import { useHandleLibrary } from "@xcalidraw/xcalidraw";

export const App = () => {
  // ...
  useHandleLibrary({ xcalidrawAPI });
};
```

**Signature**

<pre>
useHandleLibrary(opts: &#123;<br/>&nbsp;
  xcalidrawAPI: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L494">XcalidrawAPI</a>,<br/>&nbsp;
  getInitialLibraryItems?: () => <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L253">LibraryItemsSource</a><br/>
});
</pre>

In the future, we will be adding support for handling `library` persistence to `browser storage` (or elsewhere).

### getSceneVersion

This function returns the current `scene` version.

**_Signature_**

<pre>
getSceneVersion(elements:  <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/element/types.ts#L114">XcalidrawElement[]</a>)
</pre>

**How to use**

```js
import { getSceneVersion } from "@xcalidraw/xcalidraw";
```

### sceneCoordsToViewportCoords

This function returns equivalent `viewport` coords for the provided `scene` coords in params.

```js
import { sceneCoordsToViewportCoords } from "@xcalidraw/xcalidraw";
```

**_Signature_**

<pre>
sceneCoordsToViewportCoords(&#123; sceneX: number, sceneY: number },<br/>&nbsp;
  appState: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L95">AppState</a><br/>): &#123; x: number, y: number }
</pre>

### viewportCoordsToSceneCoords

This function returns equivalent `scene` coords for the provided `viewport` coords in params.

```js
import { viewportCoordsToSceneCoords } from "@xcalidraw/xcalidraw";
```

**_Signature_**

<pre>
viewportCoordsToSceneCoords(&#123; clientX: number, clientY: number },<br/>&nbsp;
  appState: <a href="https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/types.ts#L95">AppState</a><br/>): &#123;x: number, y: number}
</pre>

### useEditorInterface

This hook can be used to check the type of device which is being used. It can only be used inside the `children` of `Xcalidraw` component.

Open the `main menu` in the below example to view the footer.

```jsx live noInline
const MobileFooter = ({}) => {
  const editorInterface = useEditorInterface();
  if (editorInterface.formFactor === "phone") {
    return (
      <Footer>
        <button
          className="custom-footer"
          style={{ marginLeft: "20px", height: "2rem" }}
          onClick={() => alert("This is custom footer in mobile menu")}
        >
          custom footer
        </button>
      </Footer>
    );
  }
  return null;
};
const App = () => (
  <div style={{ height: "400px" }}>
    <Xcalidraw>
      <MainMenu>
        <MainMenu.Item> Item1 </MainMenu.Item>
        <MainMenu.Item> Item 2 </MainMenu.Item>
        <MobileFooter />
      </MainMenu>
    </Xcalidraw>
  </div>
);

// Need to render when code is span across multiple components
// in Live Code blocks editor
render(<App />);
```

The `device` has the following `attributes`, some grouped into `viewport` and `editor` objects, per context.

| Name | Type | Description |
| ---- | ---- | ----------- |

The `EditorInterface` object has the following properties:

| Name | Type | Description |
| --- | --- | --- | --- | --- | --- |
| `formFactor` | `'phone' | 'tablet' | 'desktop'` | Indicates the device type based on screen size |
| `desktopUIMode` | `'compact' | 'full'` | UI mode for desktop form factor |
| `userAgent.raw` | `string` | Raw user agent string |
| `userAgent.isMobileDevice` | `boolean` | True if device is mobile |
| `userAgent.platform` | `'ios' | 'android' | 'other' | 'unknown'` | Device platform |
| `isTouchScreen` | `boolean` | True if touch events are detected |
| `canFitSidebar` | `boolean` | True if sidebar can fit in the viewport |
| `isLandscape` | `boolean` | True if viewport is in landscape mode |

### i18n

To help with localization, we export the following.

| name | type |
| --- | --- |
| `defaultLang` | `string` |
| `languages` | [`Language[]`](https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/i18n.ts#L15) |
| `useI18n` | [`() => { langCode, t }`](https://github.com/xcalidraw/xcalidraw/blob/master/packages/xcalidraw/i18n.ts#L15) |

```js
import { defaultLang, languages, useI18n } from "@xcalidraw/xcalidraw";
```

#### defaultLang

Default language code, `en`.

#### languages

List of supported language codes. You can pass any of these to `Xcalidraw`'s [`langCode` prop](/docs/@xcalidraw/xcalidraw/api/props/#langcode).

#### useI18n

A hook that returns the current language code and translation helper function. You can use this to translate strings in the components you render as children of `<Xcalidraw>`.

```jsx live
function App() {
  const { t } = useI18n();
  return (
    <div style={{ height: "500px" }}>
      <Xcalidraw>
        <button
          style={{ position: "absolute", zIndex: 10, height: "2rem" }}
          onClick={() => window.alert(t("labels.madeWithXcalidraw"))}
        >
          {t("buttons.confirm")}
        </button>
      </Xcalidraw>
    </div>
  );
}
```

### getCommonBounds

This util can be used to get the common bounds of the passed elements.

**_Signature_**

```ts
getCommonBounds(
  elements: readonly XcalidrawElement[]
): readonly [
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
]
```

**_How to use_**

```js
import { getCommonBounds } from "@xcalidraw/xcalidraw";
```

### elementsOverlappingBBox

To filter `elements` that are inside, overlap, or contain the `bounds` rectangle.

The bounds check is approximate and does not precisely follow the element's shape. You can also supply `errorMargin` which effectively makes the `bounds` larger by that amount.

This API has 3 `type`s of operation: `overlap`, `contain`, and `inside`:

- `overlap` - filters elements that are overlapping or inside bounds.
- `contain` - filters elements that are inside bounds or bounds inside elements.
- `inside` - filters elements that are inside bounds.

**_Signature_**

<pre>
elementsOverlappingBBox(<br/>&nbsp;
  elements: readonly NonDeletedXcalidrawElement[];<br/>&nbsp;
  bounds: <a href="https://github.com/xcalidraw/xcalidraw/blob/9c425224c789d083bf16e0597ce4a429b9ee008e/src/element/bounds.ts#L37-L42">Bounds</a> | XcalidrawElement;<br/>&nbsp;
  errorMargin?: number;<br/>&nbsp;
  type: "overlap" | "contain" | "inside";<br/>
): NonDeletedXcalidrawElement[];
</pre>

**_How to use_**

```js
import { elementsOverlappingBBox } from "@xcalidraw/xcalidraw";
```

### isElementInsideBBox

Lower-level API than `elementsOverlappingBBox` to check if a single `element` is inside `bounds`. If `eitherDirection=true`, returns `true` if `element` is fully inside `bounds` rectangle, or vice versa. When `false`, it returns `true` only for the former case.

**_Signature_**

<pre>
isElementInsideBBox(<br/>&nbsp;
  element: NonDeletedXcalidrawElement,<br/>&nbsp;
  bounds: <a href="https://github.com/xcalidraw/xcalidraw/blob/9c425224c789d083bf16e0597ce4a429b9ee008e/src/element/bounds.ts#L37-L42">Bounds</a>,<br/>&nbsp;
  eitherDirection = false,<br/>
): boolean
</pre>

**_How to use_**

```js
import { isElementInsideBBox } from "@xcalidraw/xcalidraw";
```

### elementPartiallyOverlapsWithOrContainsBBox

Checks if `element` is overlapping the `bounds` rectangle, or is fully inside.

**_Signature_**

<pre>
elementPartiallyOverlapsWithOrContainsBBox(<br/>&nbsp;
  element: NonDeletedXcalidrawElement,<br/>&nbsp;
  bounds: <a href="https://github.com/xcalidraw/xcalidraw/blob/9c425224c789d083bf16e0597ce4a429b9ee008e/src/element/bounds.ts#L37-L42">Bounds</a>,<br/>
): boolean
</pre>

**_How to use_**

```js
import { elementPartiallyOverlapsWithOrContainsBBox } from "@xcalidraw/xcalidraw";
```
