import { compile_shader } from "./gl-base.js";
export class Shader {
    gl;
    name;
    handle;
    constructor(gl, name, text = null) {
        this.gl = gl;
        this.name = name;
        if (text !== null) {
            this.handle = compile_shader(gl, name, text);
        }
        else {
            let xhr1 = new XMLHttpRequest();
            xhr1.open('GET', this.name, false);
            xhr1.send();
            let source = xhr1.responseText;
            this.handle = compile_shader(gl, name, source);
        }
    }
}
;
//# sourceMappingURL=wb-shader.js.map