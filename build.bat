fixjsstyle *.js

gjslint --disable 0110 *.js

java -jar compiler.jar ^
--process_closure_primitives ^
--closure_entry_point wideboard.App ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--warning_level VERBOSE ^
--externs externs.js ^
--js closure-library/closure/goog/base.js ^
--js closure-library/closure/goog/string/string.js ^
--js closure-library/closure/goog/debug/error.js ^
--js closure-library/closure/goog/asserts/asserts.js ^
--js closure-library/closure/goog/array/array.js ^
--js closure-library/closure/goog/math/math.js ^
--js closure-library/closure/goog/math/coordinate.js ^
--js closure-library/closure/goog/math/vec2.js ^
--js closure-library/closure/goog/math/box.js ^
--js closure-library/closure/goog/math/size.js ^
--js closure-library/closure/goog/math/rect.js ^
--js closure-library/closure/goog/webgl/webgl.js ^
--js wb-dragtarget.js ^
--js wb-util.js ^
--js wb-camera.js ^
--js wb-controls.js ^
--js wb-context.js ^
--js wb-attribute.js ^
--js wb-uniform.js ^
--js wb-buffer.js ^
--js wb-draw.js ^
--js wb-grid.js ^
--js wb-file.js ^
--js wb-shader.js ^
--js wb-texture.js ^
--js wb-document.js ^
--js wb-app.js ^
--js_output_file wideboard-compiled.js

rm wideboard-compiled.js