Wideboard
=========

This repo is a revamp of an old proof of concept that I wrote in 2013 to answer
the question "How much text can you render in a web browser at once?", for
which the answer is "At least the entire Linux kernel, or as much text as will
fit in your GPU's ram".

Wideboard uses WebGL 1, some special shaders, and some simple GPU-compatible
data structures to render arbitrarily large amounts of monospace, unformatted
text in a web browser.

To launch Wideboard, run "python3 -m http.server" in in the root of this repo
and then go to http://localhost:8000. By default it renders this README.md
message and all files with extensions (h|hpp|c|cc|cpp|sh|js|ts|txt|md) under
/docs.

You can drag and mousewheel-zoom the view ala Google Maps and it should render
at 60 frames per second even when displaying tens of millions of lines of text
on a weak integrated GPU. Arrow keys and pageup/pagedown scroll the view, escape
resets the view.

To render the entire Linux kernel source tree in your browser, check out
https://github.com/torvalds/linux under /docs and refresh the page. This will
use a _lot_ of GPU ram and there's no real error checking if you run out, so
proceed with caution.

NOTE - If you're running the server under WSL, loading will take _ages_ as
WSL seems to add ~300 milliseconds of delay per HTTP connection. Running
directly under Windows or on Linux will load files 30x faster.

Above this message you'll see three squares - the left one contains lines of
ASCII text packed into a 4096x4096 texture, the middle one contains one texel
per line of source text that encodes a 24-bit pointer into the ASCII text and
an 8-bit line length, the right square is the font used (Terminus). Wideboard
will create more textures as needed to hold text, up to the capacity of your
GPU.

![Wideboard zoom 0](docs/wideboard_zoom0.jpg "Wideboard zoom 0")
![Wideboard zoom 1](docs/wideboard_zoom1.jpg "Wideboard zoom 1")
![Wideboard zoom 2](docs/wideboard_zoom2.jpg "Wideboard zoom 2")
![Wideboard zoom 3](docs/wideboard_zoom3.jpg "Wideboard zoom 3")
![Wideboard zoom 4](docs/wideboard_zoom4.jpg "Wideboard zoom 4")
![Wideboard zoom 5](docs/wideboard_zoom5.jpg "Wideboard zoom 5")
