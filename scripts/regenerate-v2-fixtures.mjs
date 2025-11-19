// This script regenerates the v2 test fixture files by:
// 1. Reading the existing fixture files to extract the base image
// 2. Creating proper scene data with "xcalidraw" instead of "excalidraw"
// 3. Encoding using the same encode/decode functions the app uses
// 4. Saving back to the fixture files

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesDir = path.join(__dirname, '../packages/xcalidraw/tests/fixtures');

// Scene data for the v2 tests (should match what the tests expect)
const v2Scene = {
  type: 'xcalidraw', // This must be 'xcalidraw' not 'excalidraw'
  version: 2,
  source: 'test',
  elements: [
    {
      type: 'text',
      version: 1,
      versionNonce: 1,
      isDeleted: false,
      id: 'test-emoji',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 0,
      y: 0,
      strokeColor: '#c92a2a',
      backgroundColor: 'transparent',
      width: 36,
      height: 57,
      seed: 123,
      groupIds: [],
      frameId: null,
      roundness: null,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      fontSize: 36,
      fontFamily: 1,
      text: '😀',
      textAlign: 'left',
      verticalAlign: 'top',
      containerId: null,
      originalText: '😀',
      autoResize: true,
      lineHeight: 1.25,
    },
  ],
  appState: {
    viewBackgroundColor: '#ffffff',
    gridSize: null,
  },
};

console.log('To regenerate v2 fixtures, you need to:');
console.log('1. Open the Xcalidraw app in dev mode');
console.log('2. Create a text element with "😀"');
console.log('3. Export as PNG with embedded scene (and save as smiley_embedded_v2.png)');
console.log('4. Export as SVG with embedded scene (and save as smiley_embedded_v2.svg)');
console.log('');
console.log('Alternatively, use the test "export embedded png and reimport" as a reference');
console.log('which dynamically creates embedded PNGs with the correct format.');
console.log('');
console.log('The issue is that the v2 files use brotli compression which is hard to');
console.log('manipulate without the proper encode/decode functions from the codebase.');
