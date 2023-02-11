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
            let self = this;
            fetch(this.name).then((response) => response.text()).then((text) => {
                self.handle = compile_shader(self.gl, self.name, text);
            });
        }
    }
}
;
//# sourceMappingURL=wb-shader.js.map