// Handles context creation/destruction, might do state tracking later...
export class Context {
    canvas;
    gl_;
    instanceExtension;
    frameCounter;
    activeIndexBuffer;
    activeTextures;
    constructor(canvas) {
        this.canvas = canvas;
        this.instanceExtension = null;
        this.frameCounter = 0;
        this.activeIndexBuffer = null;
        this.activeTextures = new Array(32);
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