uniform vec4 modelToWorld;
uniform vec4 screenSize;
uniform vec4 worldToView;
uniform sampler2D texture;

varying vec4 fcol;
varying vec4 ftex;

//------------------------------------------------------------------------------

#ifdef _VERTEX_

attribute vec4 vpos;
attribute vec4 vcol;
attribute vec4 vtex;

void main(void) {
  vec2 p = vpos.xy;
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

  fcol = vcol;
  ftex = vtex;
}

#endif

//------------------------------------------------------------------------------

#ifdef _FRAGMENT_

void main(void) {
  gl_FragColor = texture2D(texture, ftex.xy) * fcol;
  gl_FragColor.a = 1.0;
}

#endif

//------------------------------------------------------------------------------
