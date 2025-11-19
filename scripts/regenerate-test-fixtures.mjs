import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tEXt from 'png-chunk-text';
import encodePng from 'png-chunks-encode';
import decodePng from 'png-chunks-extract';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OLD_MIME_TYPE = 'application/vnd.excalidraw+json';
const NEW_MIME_TYPE = 'application/vnd.xcalidraw+json';

// Fix PNG file - replace old MIME type keyword with new one AND fix embedded JSON
function fixPNG(filePath) {
  const pngBuffer = fs.readFileSync(filePath);
  const chunks = decodePng(new Uint8Array(pngBuffer));
  
  let modified = false;
  const newChunks = chunks.map((chunk) => {
    if (chunk.name === 'tEXt') {
      const decoded = tEXt.decode(chunk.data);
      if (decoded.keyword === OLD_MIME_TYPE || decoded.keyword === NEW_MIME_TYPE) {
        // Fix the embedded JSON data: "excalidraw" -> "xcalidraw"
        let text = decoded.text;
        if (text.includes('"excalidraw"')) {
          text = text.replace(/"excalidraw"/g, '"xcalidraw"');
          modified = true;
        }
        // Replace with new keyword if needed
        const keyword = decoded.keyword === OLD_MIME_TYPE ? NEW_MIME_TYPE : decoded.keyword;
        if (decoded.keyword === OLD_MIME_TYPE) {
          modified = true;
        }
        if (modified) {
          return tEXt.encode(keyword, text);
        }
      }
    }
    return chunk;
  });
  
  if (modified) {
    const newPngBuffer = Buffer.from(encodePng(newChunks));
    fs.writeFileSync(filePath, newPngBuffer);
    console.log(`✓ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`  Skipped ${path.basename(filePath)} (already correct or no metadata)`);
  }
}

// Fix SVG file - replace old MIME type in payload-type comment AND fix embedded JSON
function fixSVG(filePath) {
  let svgContent = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  const oldPayloadType = `<!-- payload-type:${OLD_MIME_TYPE} -->`;
  const newPayloadType = `<!-- payload-type:${NEW_MIME_TYPE} -->`;
  
  // Fix MIME type in comment
  if (svgContent.includes(oldPayloadType)) {
    svgContent = svgContent.replace(oldPayloadType, newPayloadType);
    modified = true;
  }
  
  // Fix svg-source comment if present
  if (svgContent.includes('<!-- svg-source:excalidraw -->')) {
    svgContent = svgContent.replace(
      /<!-- svg-source:excalidraw -->/g,
      '<!-- svg-source:xcalidraw -->'
    );
    modified = true;
  }
  
  // Fix the embedded base64 JSON data: "excalidraw" -> "xcalidraw"
  const payloadMatch = svgContent.match(/<!-- payload-start -->([\s\S]+?)<!-- payload-end -->/);
  if (payloadMatch) {
    const base64Payload = payloadMatch[1].trim();
    try {
      // Decode, fix, re-encode
      const decoded = Buffer.from(base64Payload, 'base64').toString('utf8');
      if (decoded.includes('"excalidraw"')) {
        const fixed = decoded.replace(/"excalidraw"/g, '"xcalidraw"');
        const reencoded = Buffer.from(fixed, 'utf8').toString('base64');
        svgContent = svgContent.replace(base64Payload, reencoded);
        modified = true;
      }
    } catch (e) {
      console.warn(`  Warning: Could not decode/fix base64 payload in ${path.basename(filePath)}`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, svgContent, 'utf8');
    console.log(`✓ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`  Skipped ${path.basename(filePath)} (already correct)`);
  }
}

// Main execution
const fixturesDir = path.join(__dirname, '../packages/xcalidraw/tests/fixtures');

console.log('Fixing test fixture files with correct MIME types...\n');

// Fix PNG files
fixPNG(path.join(fixturesDir, 'test_embedded_v1.png'));
fixPNG(path.join(fixturesDir, 'smiley_embedded_v2.png'));

// Fix SVG files
fixSVG(path.join(fixturesDir, 'test_embedded_v1.svg'));
fixSVG(path.join(fixturesDir, 'smiley_embedded_v2.svg'));

console.log('\nDone! All fixture files updated.');
