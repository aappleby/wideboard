// Handles context creation/destruction, might do state tracking later...
export class Context {
    canvas;
    gl_;
    instanceExtension;
    frameCounter;
    activeProgram;
    activeArrayBuffer;
    activeIndexBuffer;
    activeTextures;
    constructor(canvas) {
        this.canvas = canvas;
        this.instanceExtension = null;
        this.frameCounter = 0;
        this.activeProgram = null;
        this.activeArrayBuffer = null;
        this.activeIndexBuffer = null;
        this.activeTextures = new Array(32);
        var options = {
            alpha: true,
            depth: true,
            stencil: false,
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
        };
        // @ts-ignore
        this.gl_ = this.canvas.getContext('webgl', options);
        var extension = this.gl_.getExtension("ANGLE_instanced_arrays");
        if (extension) {
            for (var name in extension) {
                var val = extension[name];
                if (val && typeof (val) == 'function') {
                    // FIXME
                    this.gl_[name] = val.bind(extension);
                    console.log(name);
                }
                else {
                    this.gl_[name] = val;
                }
            }
            console.log('Extension ANGLE_instanced_arrays installed');
        }
        else {
            console.log('Extension ANGLE_instanced_arrays not found');
        }
    }
    getGl() {
        return this.gl_;
    }
    ;
    beginFrame() {
        this.frameCounter++;
    }
    endFrame() {
    }
}
;
//# sourceMappingURL=wb-context.js.map