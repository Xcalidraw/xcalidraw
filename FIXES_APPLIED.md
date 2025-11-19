# Test Fixes Applied After Renaming "excalidraw" to "xcalidraw"

## Summary
After renaming all instances of "excalidraw" to "xcalidraw" in the codebase, 8 tests were failing. I've fixed 6 of them, with 2 remaining that need manual regeneration of fixture files.

## Fixes Applied

### 1. Library Fixture File ✅
**File**: `packages/xcalidraw/tests/fixtures/fixture_library.xcalidrawlib`

**Issue**: The `type` field had `"excalidrawlib"` instead of `"xcalidrawlib"`

**Fix**: Changed line 2:
```json
{
  "type": "xcalidrawlib",  // was "excalidrawlib"
  ...
}
```

### 2. Embedded Scene Test Fixtures (v1) ✅
**Files**:
- `packages/xcalidraw/tests/fixtures/test_embedded_v1.png`
- `packages/xcalidraw/tests/fixtures/test_embedded_v1.svg`

**Issues**:
1. PNG tEXt chunk keyword: `application/vnd.excalidraw+json` → `application/vnd.xcalidraw+json`
2. Embedded JSON data: `"type": "excalidraw"` → `"type": "xcalidraw"`
3. SVG comments: `<!-- svg-source:excalidraw -->` → `<!-- svg-source:xcalidraw -->`

**Fix**: Ran `scripts/regenerate-test-fixtures.mjs` which:
- Updates PNG metadata keywords
- Fixes embedded JSON data in both PNG and SVG files
- Updates SVG comment tags

## Remaining Issues

### 3. Embedded Scene Test Fixtures (v2) ❌
**Files**:
- `packages/xcalidraw/tests/fixtures/smiley_embedded_v2.png`
- `packages/xcalidraw/tests/fixtures/smiley_embedded_v2.svg`

**Issue**: These files use brotli-compressed embedded data that contains old "excalidraw" references. The compression makes simple text replacement impossible without corrupting the files.

**Solution Options**:

#### Option A: Regenerate from the app (Recommended)
1. Run the dev server: `yarn start`
2. Create a text element with "😀"
3. Export as PNG with "Embed scene" enabled
4. Save as `packages/xcalidraw/tests/fixtures/smiley_embedded_v2.png`
5. Export as SVG with "Embed scene" enabled  
6. Save as `packages/xcalidraw/tests/fixtures/smiley_embedded_v2.svg`

#### Option B: Use the dynamic test pattern
The test "export embedded png and reimport" (line 65-78 in `export.test.tsx`) shows how to dynamically create embedded PNGs:
```typescript
const pngBlob = await API.loadFile("./fixtures/smiley.png");
const pngBlobEmbedded = await encodePngMetadata({
  blob: pngBlob,
  metadata: serializeAsJSON(testElements, h.state, {}, "local"),
});
```

You could modify the v2 tests to use this dynamic approach instead of relying on static fixture files.

#### Option C: Remove/skip the v2 tests
Since the v1 tests already verify the legacy format and the dynamic test verifies the current format, the v2 fixture-based tests may be redundant.

## Test Results

**Before fixes**: 8 failed tests
**After fixes**: 2 failed tests (75% improvement)

**Passing**: 
- ✅ All library tests
- ✅ Export embedded PNG (legacy v1)
- ✅ Export embedded SVG (legacy v1)

**Still failing**:
- ❌ Export embedded PNG (v2) - requires fixture regeneration
- ❌ Export embedded SVG (v2) - requires fixture regeneration

## Scripts Created

1. **`scripts/regenerate-test-fixtures.mjs`**
   - Fixes MIME types and embedded JSON in v1 fixture files
   - Safe to run multiple times (idempotent)
   - Run with: `node scripts/regenerate-test-fixtures.mjs`

2. **`scripts/regenerate-v2-fixtures.mjs`**
   - Documentation on how to regenerate v2 fixtures
   - Run with: `node scripts/regenerate-v2-fixtures.mjs`
