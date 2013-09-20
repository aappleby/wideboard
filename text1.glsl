uniform vec4 modelToWorld;
uniform vec4 worldToView;
uniform vec4 screenSize;

uniform sampler2D texture;

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
  p += vec2(0.5, 0.5);
  p -= screenSize.xy;
  p /= screenSize.zw;
  p *= 2.0;
  p -= vec2(1.0, 1.0);
  p *= vec2(1.0, -1.0);
  gl_Position = vec4(p.x, p.y, 1.0, 1.0);
  ftex = vtex;
}

#else

void main(void) {
  gl_FragColor = texture2D(texture, ftex);
}

#endif