// Simple file object.

export class File  {
  path : string;
  binary : boolean;
  request : XMLHttpRequest | null;
  contents : string | Uint8Array | null;

  constructor(path : string, binary : boolean) {
    this.path = path;
    this.binary = binary;
    this.request = null;
    this.contents = null;
  }

  // Asynchronously loads a file.
  load() {
    this.request = new XMLHttpRequest();
    this.request.onreadystatechange = this.callback.bind(this);
    this.request.open('GET', this.path, true);
    if (this.binary) {
      this.request.responseType = 'arraybuffer';
    }
    this.request.send();
  };

  // File load callback.
  callback() {
    if (this.request != null && this.request.readyState == 4) {
      console.log('hit callback');
      if (this.binary) {
        var buffer : ArrayBuffer = this.request.response;
        this.contents = new Uint8Array(buffer);
      } else {
        this.contents = this.request.responseText;
      }
      console.log(this.contents);
    }
  };
};
