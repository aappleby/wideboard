//------------------------------------------------------------------------------

#ifdef _VERTEX_

uniform vec4 screenSize;
uniform vec4 modelToWorld;
uniform vec4 worldToView;

attribute vec2 vpos;

void main(void) {
  vec2 p = vpos;

  p *= modelToWorld.zw;
  p += modelToWorld.xy;
  p += worldToView.xy;
  p *= worldToView.zw;
  p += vec2(0.5, 0.5);
  p -= screenSize.xy;
  p *= screenSize.zw;
  p *= 2.0;
  p -= vec2(1.0, 1.0);
  p *= vec2(1.0, -1.0);

  gl_Position = vec4(p.x, p.y, 0.0, 1.0);
}

#endif

//------------------------------------------------------------------------------

#ifdef _FRAGMENT_

void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}

#endif

//------------------------------------------------------------------------------
