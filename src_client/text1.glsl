uniform vec4 worldToView;
uniform vec4 screenSize;

uniform sampler2D docmap;
uniform sampler2D linemap;
uniform sampler2D glyphmap;

uniform vec2 docmapSize;
uniform vec2 linemapSize;
uniform vec2 glyphmapSize;

uniform vec2 glyphSize;
uniform vec2 cellSize;

uniform vec4 background;
uniform vec4 foreground;
uniform vec4 lineHighlight;
uniform vec2 cursor;

uniform float wavey;
uniform float ftime;

varying vec2 ftex;
varying vec4 fcol;
varying float fShelfPos;

#ifdef _VERTEX_

attribute vec2 vpos;
attribute vec2 vtex;
attribute vec4 iColor;

// X: screen X
// Y: screen Y
// Z: line count
// W: shelf position
attribute vec4 iDocPos;
//uniform vec4 iDocPos;

void main(void) {
  vec2 p = vpos;
  p *= glyphSize;
  p *= vec2(128.0, iDocPos.z);
  p += iDocPos.xy;

  float phase = (iDocPos.x / 10000.0) + 0.31 * (iDocPos.y / 10000.0);
  p += vec2(sin(ftime + phase), cos(ftime * 1.1 + phase)) * 1000.0 * wavey;

  p += worldToView.xy;
  p *= worldToView.zw;
  p -= screenSize.xy;
  p *= screenSize.zw;
  p *= 2.0;
  p -= vec2(1.0, 1.0);
  p *= vec2(1.0, -1.0);
  gl_Position = vec4(p.x, p.y, 1.0, 1.0);

  ftex = vpos * vec2(128.0, iDocPos.z);
  fcol = iColor;
  float blah = sin(ftime + phase) * -0.2 + 0.2;
  fcol += vec4(blah, blah, blah, 0.0) * wavey;
  fShelfPos = iDocPos.w;
}

#else

void main(void) {
  float glyphsPerRow = glyphmapSize.x / cellSize.x;
  float glyphsPerCol = glyphmapSize.y / cellSize.y;

  // Split the texture coordinate into the document position & the inside-cell position.
  vec2 cellPos = ftex;
  vec2 docPos = floor(cellPos);
  cellPos -= docPos;

  vec4 back = fcol;
  if (docPos.y == cursor.y) {
    back += lineHighlight;
    if (docPos.x == cursor.x) {
      if (cellPos.x <= 0.125) {
        back = vec4(0.8, 0.8, 0.8, 0.7);
      }
    }
  }


  docPos.y += fShelfPos;

  vec2 docmapPos = vec2(mod(docPos.y, docmapSize.x), floor(docPos.y / docmapSize.x));

  // Read line info from docmap.
  vec4 lineInfo = texture2D(docmap, (docmapPos + vec2(0.5, 0.5)) / docmapSize);
  float lineLength = floor(lineInfo.a * 255.0 + 0.5);

  // Return the background color if the doc x coordinate is past the line end.
  if (docPos.x >= lineLength) {
    gl_FragColor = back;
    return;
  }

  // Convert line info into line start index + line length.
  float startIndex = dot(lineInfo.rgb, vec3(255.0, 255.0*256.0, 255.0*256.0*256.0));

  // We're inside the line. Add the line start index to the doc X coordinate to get the integer linemap
  // index.
  
  float lineIndex = startIndex + docPos.x;

  // Wrap the linemap index around the linemap to get the integer linemap position.
  vec2 linePos = vec2(mod(lineIndex, linemapSize.x), floor(lineIndex / linemapSize.x));

  //gl_FragColor = vec4(linePos.x / 32.0, linePos.y / 32.0, 0.0, 1.0);

  //vec2 linePos = docPos;

  // Read the glyph index from the linemap & convert to an integer.
  float glyphIndex = texture2D(linemap, (linePos + vec2(0.5, 0.5)) / linemapSize).r * 255.0;

  // Wrap glyph index around glyphmap to get integer glyph position.
  vec2 glyphCell = vec2(mod(glyphIndex, glyphsPerRow), floor(glyphIndex / glyphsPerRow));

  // Combine glyph position with inside-cell position to get sample position in texel coordinates.
  vec2 glyphLoc = glyphCell * cellSize + cellPos * glyphSize + vec2(0.0, 2.0);
  
  // Read output color from glyphmap.
  float result = texture2D(glyphmap, glyphLoc / glyphmapSize).r;

  result = sqrt(result);//smoothstep(0.0, 0.6, result);

  gl_FragColor = mix(back, foreground, result);
}

#endif