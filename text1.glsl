uniform vec4 modelToWorld;
uniform vec4 worldToView;
uniform vec4 screenSize;

uniform sampler2D docmap;
uniform sampler2D glyphmap;

//uniform vec4 docmapSize;

attribute vec2 vpos;
attribute vec2 vtex;

varying vec2 ftex;

#ifdef _VERTEX_

void main(void) {
  vec2 p = vpos;
  p *= modelToWorld.zw;
  p += modelToWorld.xy;
  p += worldToView.xy;
  p *= worldToView.zw;
  p -= screenSize.xy;
  p *= screenSize.zw;
  p *= 2.0;
  p -= vec2(1.0, 1.0);
  p *= vec2(1.0, -1.0);
  gl_Position = vec4(p.x, p.y, 1.0, 1.0);
  ftex = vtex;
}

#else

void main(void) {
  const vec2 docmapSize = vec2(32.0, 32.0);
  const vec2 glyphmapSize = vec2(256.0, 256.0);
  const vec2 glyphSize = vec2(6.0, 14.0);
  const vec2 cellSize = vec2(8.0, 16.0);
  const vec2 glyphOffset = vec2(0.0, 1.0);
  const float glyphsPerRow = glyphmapSize.x / cellSize.x;
  const float glyphsPerCol = glyphmapSize.y / cellSize.y;

  /*
  vec2 docPos = ftex * vec2(32.0 * 6.0, 32.0 * 14.0);

  vec2 glyphSamplePos = fract(docPos) ;

  float result = texture2D(glyphmap, docPos / glyphmapSize).r;

  gl_FragColor = vec4(result, result, result, 1.0);
  */

  vec2 docFract = ftex * docmapSize;
  vec2 docInt = floor(docFract);
  docFract -= docInt;

  // Read docmap, convert [0,1] color to [0,255] glyph index.
  float glyphIndex = texture2D(docmap, (docInt + vec2(0.5, 0.5)) / docmapSize).r * 255.0;

  vec2 glyphInt = vec2(mod(glyphIndex, glyphsPerRow),
                       floor(glyphIndex / glyphsPerRow));

  vec2 glyphLoc = glyphInt * cellSize + docFract * glyphSize + glyphOffset;

  vec2 glyphSamplePos = fract(glyphLoc);

  float result = texture2D(glyphmap, glyphLoc / glyphmapSize).r;

  gl_FragColor = vec4(result, result, result, 1.0);
}

#endif