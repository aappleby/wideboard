//----------

uniform vec4 worldToView;
uniform vec4 screenSize;

//----------

uniform sampler2D docmap;
uniform sampler2D linemap;
uniform sampler2D glyphmap;

//----------

uniform vec4 background;
uniform vec4 foreground;
uniform vec4 lineHighlight;
uniform vec2 cursor;

uniform float wavey;
uniform float ftime;

//----------

varying vec2 ftex;
varying vec4 fcol;
varying float shelf_offset;

//------------------------------------------------------------------------------

#ifdef _VERTEX_

attribute vec2 vpos;
attribute vec4 iColor;

// X: screen X
// Y: screen Y
// Z: line count
// W: shelf position
attribute vec4 iDocPos;

void main(void) {
  float text_cols = 85.0;
  vec2 glyphSize = vec2(6.0, 14.0);

  vec2 p = vpos;
  p *= glyphSize;
  p *= vec2(text_cols, iDocPos.z);
  p += iDocPos.xy;

  //float phase = (iDocPos.x / 10000.0) + 0.31 * (iDocPos.y / 10000.0);
  //p += vec2(sin(ftime + phase), cos(ftime * 1.1 + phase)) * 1000.0 * wavey;

  p += worldToView.xy;
  p *= worldToView.zw;
  p -= screenSize.xy;
  p *= screenSize.zw;
  p *= 2.0;
  p -= vec2(1.0, 1.0);
  p *= vec2(1.0, -1.0);
  gl_Position = vec4(p.x, p.y, 1.0, 1.0);

  ftex = vpos * vec2(text_cols, iDocPos.z);
  fcol = iColor;
  //float blah = sin(ftime + phase) * -0.2 + 0.2;
  //fcol += vec4(blah, blah, blah, 0.0) * wavey;
  shelf_offset = iDocPos.w;
}

#endif

//------------------------------------------------------------------------------

#ifdef _FRAGMENT_

// docmap is 1024x1024
// linemap is 4096x4096
// glyphmap is 256x256

void main(void) {

  // Split the texture coordinate into the document position & the inside-cell position.
  float col = floor(ftex.x);
  float row = floor(ftex.y);
  vec2  cellPos = fract(ftex);

  vec4 back = fcol;
  if (row == cursor.y) {
    back += lineHighlight;
    if (col == cursor.x && cellPos.x <= 0.125) {
      back = vec4(0.8, 0.8, 0.8, 0.7);
    }
  }

  float tn10 = 1.0 / 1024.0;
  float tn11 = 1.0 / 2048.0;
  float tn12 = 1.0 / 4096.0;
  float tn13 = 1.0 / 8192.0;

  // Convert line number + shelf offset to docmap texcoord
  vec2 docmapPos;
  docmapPos.x = fract((row + shelf_offset) * tn10) + tn11;
  docmapPos.y = floor((row + shelf_offset) * tn10) * tn10 + tn11;

  // Read line info from docmap.
  vec4 lineInfo = texture2D(docmap, docmapPos);

  // Convert line info into offset into the linemap + line length.
  float line_offset = dot(lineInfo.rgb, vec3(255.0, 255.0*256.0, 255.0*256.0*256.0));
  float line_length = floor(lineInfo.a * 255.0 + 0.5);

  // Return the background color if the doc x coordinate is past the line end.
  if (col >= line_length) {
    gl_FragColor = back;
    return;
  }

  // We're inside the line. Add the line start index to the doc X coordinate to get the integer linemap
  // index.
  float lineIndex = line_offset + col;

  // Wrap the linemap index around the linemap to get the integer linemap position.
  vec2 linePos;
  linePos.x = fract(lineIndex * tn12) + tn13;
  linePos.y = floor(lineIndex * tn12) * tn12 + tn13;

  // Read the glyph index from the linemap & convert to an integer.
  float glyphIndex = floor(texture2D(linemap, linePos).r * 255.0 + 0.5);

  // Wrap glyph index around glyphmap to get integer glyph position.
  vec2 glyphCell;
  glyphCell.x = fract(glyphIndex * (1.0 / 32.0));
  glyphCell.y = floor(glyphIndex * (1.0 / 32.0));

  // Combine glyph position with inside-cell position to get sample position in texel coordinates.
  vec2 glyphLoc = (glyphCell * vec2(32.0 * 8.0 / 256.0, 16.0 / 256.0) + cellPos * vec2(6.0 / 256.0, 14.0 / 256.0));

  // Read output color from glyphmap.
  float result = texture2D(glyphmap, glyphLoc).r;
  gl_FragColor = mix(back, foreground, result);
}

#endif

//------------------------------------------------------------------------------
