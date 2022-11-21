Wideboard
=========

This repo is an old proof of concept for "how much text can you render in a web browser at once?", for which the answer is "At least the entire Linux kernel, or as much text as will fit in your GPU's ram".

Wideboard uses vanilla WebGL 1, some special shaders, and some GPU-compatible data structures to render arbitrarily large amounts of monospace, unformatted text in a web browser - you can zoom in and out on each file ala Google Maps, and it should render at 60 frames per second on even a weak integrated GPU.

The codebase is old, unmaintained, and uses Google's Closure Compiler for the frontend and an old version of Node as the backend - getting it working again, porting it to Typescript, and adding a more modern backend would be an interesting project.

![Wideboard zoom 0](docs/wideboard_zoom0.jpg "Wideboard zoom 0")
![Wideboard zoom 1](docs/wideboard_zoom1.jpg "Wideboard zoom 1")
![Wideboard zoom 2](docs/wideboard_zoom2.jpg "Wideboard zoom 2")
![Wideboard zoom 3](docs/wideboard_zoom3.jpg "Wideboard zoom 3")
![Wideboard zoom 4](docs/wideboard_zoom4.jpg "Wideboard zoom 4")
![Wideboard zoom 5](docs/wideboard_zoom5.jpg "Wideboard zoom 5")
