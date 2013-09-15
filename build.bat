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
--js closure-library/closure/goog/webgl/webgl.js ^
--js wb-util.js ^
--js wb-view.js ^
--js wb-controls.js ^
--js wb-uniform.js ^
--js wb-buffer.js ^
--js wb-draw.js ^
--js wb-file.js ^
--js wb-shader.js ^
--js wb-texture.js ^
--js wb-document.js ^
--js wb-app.js ^
--js_output_file wideboard-compiled.js

rm wideboard-compiled.js