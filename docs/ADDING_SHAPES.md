# How to Add New Shapes to Xcalidraw

This guide explains how to add a new geometric shape (like triangle, hexagon, star, etc.) to the Xcalidraw toolbar.

## Overview

Xcalidraw uses **rough.js** for rendering hand-drawn style shapes. The key primitive is:
- `generator.polygon([[x1,y1], [x2,y2], ...], options)` - draws any polygon from points

## Files to Modify

When adding a new shape, you need to modify the following files:

### 1. Type Definition
**File:** `packages/element/src/types.ts`
```typescript
// Add after XcalidrawEllipseElement
export type XcalidrawYourShapeElement = _XcalidrawElementBase & {
  type: "yourshape";
};

// Add to XcalidrawGenericElement union
export type XcalidrawGenericElement =
  | XcalidrawSelectionElement
  | XcalidrawRectangleElement
  | XcalidrawDiamondElement
  | XcalidrawEllipseElement
  | XcalidrawYourShapeElement;  // Add here
```

### 2. Shape Rendering 
**File:** `packages/element/src/shape.ts`

Add your shape to the `generateRoughOptions` switch (around line 216):
```typescript
case "yourshape":
```

Add rendering logic in `generateElementShape` (after ellipse case):
```typescript
case "yourshape": {
  // Calculate polygon points based on element.width and element.height
  const points = [
    [element.width / 2, 0],        // top center
    [element.width, element.height], // bottom right
    [0, element.height],            // bottom left
  ];
  const shape = generator.polygon(points, generateRoughOptions(element));
  return shape;
}
```

Add to `getElementShape` function (around line 934):
```typescript
case "yourshape":  // Add alongside diamond
```

### 3. Hit Testing & Collision
**File:** `packages/element/src/collision.ts`

Add case in `intersectElementWithLineSegment` (around line 252):
```typescript
case "yourshape":
  return intersectDiamondWithLineSegment(element as any, elementsMap, line, offset, onlyFirst);
```

### 4. Distance Calculation
**File:** `packages/element/src/distance.ts`

Add case in `distanceToElement` (around line 46):
```typescript
case "yourshape":
  return distanceToDiamondElement(element as any, elementsMap, p);
```

### 5. Canvas Rendering
**File:** `packages/element/src/renderElement.ts`

Add to `drawElementOnCanvas` (around line 450):
```typescript
case "yourshape":
```

Add to `renderElement` switch (around line 859):
```typescript
case "yourshape":
```

### 6. Type Checks
**File:** `packages/element/src/typeChecks.ts`

Add to `isXcalidrawElement` (around line 260):
```typescript
case "yourshape":
```

Add to `isBindableElement`, `isTextBindableContainer`, `isFlowchartNodeElement`, and `isUsingProportionalRadius`.

### 7. Settings Panel Visibility (IMPORTANT!)
**File:** `packages/element/src/comparisons.ts`

Add your shape to these functions to enable settings panel options:
```typescript
// For background/fill color
hasBackground: type === "yourshape" || ...

// For stroke color
hasStrokeColor: type === "yourshape" || ...

// For stroke width
hasStrokeWidth: type === "yourshape" || ...

// For stroke style (solid, dashed, dotted)
hasStrokeStyle: type === "yourshape" || ...
```

### 7. Element Shapes Type
**File:** `packages/xcalidraw/scene/types.ts`

Add to `ElementShapes` type:
```typescript
yourshape: Drawable;
```

### 8. Geometric Shape (for hit detection)
**File:** `packages/utils/src/shape.ts`

Add to `RectangularElement` type and import your type.
Add polygon points logic in `getPolygonShape`:
```typescript
} else if (element.type === "yourshape") {
  data = polygon(
    pointRotateRads(pointFrom(cx, y), center, angle),
    pointRotateRads(pointFrom(x + width, y + height), center, angle),
    pointRotateRads(pointFrom(x, y + height), center, angle),
  );
}
```

### 9. Transform (API)
**File:** `packages/xcalidraw/data/transform.ts`

Add `case "yourshape":` to all switch statements handling shapes (around lines 311, 386, 531, 663).

### 10. Test Helpers
**File:** `packages/xcalidraw/tests/helpers/api.ts`

Add to `createElement` switch (around line 283):
```typescript
case "yourshape":
```

### 11. Toolbar Icon
**File:** `packages/xcalidraw/components/icons.tsx`

Create an icon:
```typescript
export const YourShapeIcon = createIcon(
  <g strokeWidth="1.5">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 5l9 14h-18z" />  {/* SVG path for your shape */}
  </g>,
  tablerIconProps,
);
```

### 12. Toolbar Entry
**File:** `packages/xcalidraw/components/Actions.tsx`

Import the icon and add to `SHAPE_TOOLS`:
```typescript
{
  type: "yourshape",
  icon: YourShapeIcon,
  title: "Your Shape",
  key: "Y",  // keyboard shortcut
},
```

## Example: Triangle Points Formula

For a triangle fitting in a bounding box:
```typescript
const topX = element.width / 2;
const topY = 0;
const bottomLeftX = 0;
const bottomLeftY = element.height;
const bottomRightX = element.width;
const bottomRightY = element.height;

generator.polygon([
  [topX, topY],
  [bottomRightX, bottomRightY],
  [bottomLeftX, bottomLeftY],
], options);
```

## Testing

1. Run `yarn start` to start the dev server
2. Open `http://localhost:3000`
3. Your shape should appear in the shapes dropdown
4. Test: creating, selecting, resizing, rotating, fill, stroke

## Notes

- Use `rough.js` primitives: `generator.polygon()` for polygons, `generator.path()` for complex SVG paths
- All polygon shapes can reuse diamond's collision/distance logic
- Keep the shape's center at `(width/2, height/2)` for proper rotation
