//------------------------------------------------------------------------------
export function init_gl(gl) {
    console.log("Vendor:    " + gl.getParameter(gl.VENDOR));
    console.log("Renderer:  " + gl.getParameter(gl.RENDERER));
    console.log("Version:   " + gl.getParameter(gl.VERSION));
    console.log("GLSL:      " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    let exts = gl.getSupportedExtensions();
    for (let ext of exts) {
        console.log("Ext:       " + ext);
    }
    /*
    glGetIntegerv(GL_NUM_EXTENSIONS, &ext_count);
  
    LOG_INDENT();
    LOG_B("Vendor:   "); LOG_G("%s\n", glGetString(GL_VENDOR));
    LOG_B("Renderer: "); LOG_G("%s\n", glGetString(GL_RENDERER));
    LOG_B("Version:  "); LOG_G("%s\n", glGetString(GL_VERSION));
    LOG_B("GLSL:     "); LOG_G("%s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
    LOG_B("Ext count "); LOG_G("%d\n", ext_count);
    LOG_DEDENT();
    */
}
//------------------------------------------------------------------------------
export function compile_shader(gl, shader_name, src) {
    let vert_src = "#define _VERTEX_\n" +
        "precision highp float;\n" +
        src;
    let vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader, vert_src);
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        console.log('Fragment shader compile failed');
    }
    let fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, "#define _FRAGMENT_\n" +
        "precision highp float;\n" +
        src);
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        console.log('Fragment shader compile failed');
    }
    let program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Shader link failed!');
    }
    else {
        console.log('Shader ' + shader_name + ' linked');
    }
    gl.detachShader(program, vshader);
    gl.detachShader(program, fshader);
    gl.deleteShader(vshader);
    gl.deleteShader(fshader);
    /*
    console.log('Attributes:');
    let attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attribCount; i++) {
      let attribInfo = gl.getActiveAttrib(program, i)!;
      let location = gl.getAttribLocation(program, attribInfo.name);
      console.log(attribInfo);
      console.log(location);
    }
  
    console.log('Uniforms:');
    let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      let uniformInfo = gl.getActiveUniform(program, i)!;
      let location = gl.getUniformLocation(program, uniformInfo.name);
      console.log(uniformInfo);
      console.log(location);
    }
    */
    return program;
}
//------------------------------------------------------------------------------
//# sourceMappingURL=gl-base.js.map