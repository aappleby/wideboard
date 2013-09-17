uniform vec4 modelToWorld;
uniform vec4 worldToView;
uniform vec2 screenSize;

uniform sampler2D texture;

attribute vec2 vpos;
attribute vec2 vtex;

varying vec2 ftex;

#ifdef _VERTEX_

void main(void) {
  /*
  vec2 p = vpos;
  p += modelToWorld.xy;
  p *= modelToWorld.zw;
  p += worldToView.xy;
  p *= worldToView.zw;
  p /= screenSize.xy;
  p *= 2.0;
  p -= 1.0;
  p *= vec2(1.0, -1.0);
  */
  float sx = ((vpos.x * modelToWorld.z) + modelToWorld.x + worldToView.x) / (screenSize.x / 2.0);
  float sy = ((vpos.y * modelToWorld.w) + modelToWorld.y + worldToView.y) / (screenSize.y / 2.0);
  sy = -sy;
  gl_Position = vec4(sx, sy, 1.0, 1.0);
  ftex = vtex;
}

#else

void main(void) {
  gl_FragColor = texture2D(texture, ftex);
}

#endif