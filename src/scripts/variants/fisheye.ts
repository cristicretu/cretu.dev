/* A lens that bulges the view while it zooms, for a sense of momentum.

   Only active while a zoom is in motion: each frame the 2D canvas is uploaded as a texture and
   redrawn through a radial warp on a WebGL canvas laid over it (the 2D canvas is hidden
   meanwhile). The warp magnifies around the zoom anchor and fades to nothing at the corners,
   so the frame never shows gaps. At rest the overlay is hidden and costs nothing. */

const VERT = `
attribute vec2 p;
varying vec2 v;
void main() {
  v = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D tex;
uniform vec2 anchor;
uniform vec2 aspect;
uniform float amount;
uniform float reach;
varying vec2 v;
void main() {
  vec2 d = (v - anchor) * aspect;
  float r2 = dot(d, d) / reach;
  // Scale the sample distance down near the anchor (magnify), easing to 1 at the reach.
  float s = 1.0 - amount * max(0.0, 1.0 - r2) * max(0.0, 1.0 - r2);
  vec2 uv = anchor + (v - anchor) * s;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  gl_FragColor = texture2D(tex, uv);
}`;

export class Fisheye {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private u: Record<string, WebGLUniformLocation | null>;
  private tex: WebGLTexture;
  private shown = false;

  static create(source: HTMLCanvasElement) {
    try {
      return new Fisheye(source);
    } catch {
      return null;
    }
  }

  private constructor(private source: HTMLCanvasElement) {
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none';
    source.after(c);
    const gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { c.remove(); throw new Error('no webgl'); }
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { c.remove(); throw new Error('link'); }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.u = Object.fromEntries(['tex', 'anchor', 'aspect', 'amount', 'reach'].map((k) => [k, gl.getUniformLocation(prog, k)]));
    this.canvas = c;
    this.gl = gl;
  }

  /** Warp the current 2D frame. `amount` > 0 bulges (zooming in), < 0 pinches (zooming out). */
  render(amount: number, ax: number, ay: number) {
    const { gl, source, canvas } = this;
    if (Math.abs(amount) < 0.002) return this.hide();
    if (canvas.width !== source.width || canvas.height !== source.height) {
      canvas.width = source.width;
      canvas.height = source.height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const w = source.clientWidth || 1, h = source.clientHeight || 1;
    const aspect = w / h;
    gl.uniform1i(this.u.tex, 0);
    gl.uniform2f(this.u.anchor, ax / w, 1 - ay / h);
    gl.uniform2f(this.u.aspect, aspect, 1);
    gl.uniform1f(this.u.amount, amount);
    // Reach the farthest corner from the anchor, so the edges never move.
    const fx = Math.max(ax / w, 1 - ax / w) * aspect, fy = Math.max(ay / h, 1 - ay / h);
    gl.uniform1f(this.u.reach, fx * fx + fy * fy);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!this.shown) {
      this.shown = true;
      canvas.style.display = 'block';
      source.style.opacity = '0';
    }
  }

  hide() {
    if (!this.shown) return;
    this.shown = false;
    this.canvas.style.display = 'none';
    this.source.style.opacity = '';
  }

  dispose() {
    this.hide();
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.canvas.remove();
  }
}
