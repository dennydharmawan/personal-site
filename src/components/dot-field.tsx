import { useEffect, useRef } from 'react';

const SPACING = 12;
const MOUSE_RADIUS = 150;
const FORCE = 10;
const SPRING = 0.018;
const DAMPING = 0.8;
const RIPPLE_SPEED = 420;
const RIPPLE_WIDTH = 500;
const RIPPLE_FORCE = 10;
const RIPPLE_DECAY = 2.2;
const MAX_RIPPLES = 6;
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], form, video';

const SIM_VERT = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const SIM_FRAG = `#version 300 es
precision highp float;

uniform vec2 u_gridOrigin;
uniform float u_spacing;
uniform vec2 u_mouse;
uniform float u_mouseActive;
uniform float u_radius;
uniform float u_force;
uniform float u_spring;
uniform float u_damping;
uniform int u_rippleCount;
uniform vec3 u_ripples[6];
uniform float u_rippleSpeed;
uniform float u_rippleWidth;
uniform float u_rippleForce;
uniform float u_rippleDecay;
uniform sampler2D u_prevState;

out vec4 fragColor;

const float TAU = 6.28318530718;

float hash11(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  vec2 home = u_gridOrigin + vec2(cell) * u_spacing;

  vec4 state = texelFetch(u_prevState, cell, 0);
  vec2 offset = state.xy;
  vec2 vel = state.zw;
  vec2 pos = home + offset;

  float idHash = hash11(float(cell.x) * 1.7 + float(cell.y) * 73.0);
  vel += -offset * (u_spring * (0.8 + idHash * 0.4));

  if (u_mouseActive > 0.001) {
    vec2 away = pos - u_mouse;
    float dist2 = dot(away, away);
    float r2 = u_radius * u_radius;
    if (dist2 < r2 && dist2 > 0.01) {
      float dist = sqrt(dist2);
      float t = 1.0 - dist / u_radius;
      vel += (away / dist) * (t * t * u_force * u_mouseActive);
    }
  }

  for (int i = 0; i < 6; i++) {
    if (i >= u_rippleCount) break;
    vec3 rip = u_ripples[i];
    float age = rip.z;
    if (age < 0.0) continue;
    vec2 r = pos - rip.xy;
    float dist = length(r);
    float diff = dist - age * u_rippleSpeed;
    float amp = exp(-(diff * diff) / u_rippleWidth) * exp(-age * u_rippleDecay) * u_rippleForce;
    if (dist > 0.01) {
      vel += (r / dist) * amp;
    } else {
      float ang = hash11(idHash + float(i) * 7.0) * TAU;
      vel += vec2(cos(ang), sin(ang)) * amp;
    }
  }

  vel *= u_damping;
  offset += vel;
  fragColor = vec4(offset, vel);
}
`;

const DRAW_VERT = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_gridSize;
uniform vec2 u_gridOrigin;
uniform float u_spacing;
uniform float u_time;
uniform float u_dotSize;
uniform float u_reducedMotion;
uniform float u_density;
uniform sampler2D u_state;

out float v_alpha;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  int cols = int(u_gridSize.x);
  int row = gl_VertexID / cols;
  int col = gl_VertexID - row * cols;

  vec2 cell = vec2(float(col), float(row));
  vec2 home = u_gridOrigin + cell * u_spacing;
  // Below full density, most cells drop out and the rest jitter off the grid, so the field reads as scattered dust.
  float keep = step(hash21(cell), u_density);
  if (u_density < 1.0) {
    home += (vec2(hash21(cell + 17.0), hash21(cell + 41.0)) - 0.5) * u_spacing;
  }
  vec4 state = texelFetch(u_state, ivec2(col, row), 0);
  vec2 pos = home + state.xy;

  vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = u_dotSize * keep;

  if (u_reducedMotion > 0.5) {
    v_alpha = 0.6;
  } else {
    vec3 phase = vec3(
      home.x * 0.018 + home.y * 0.009,
      home.x * -0.012 + home.y * 0.016,
      home.x * 0.006 + home.y * -0.014
    ) + u_time * vec3(0.55, 0.38, 0.22);
    float flick = (sin(phase.x) + sin(phase.y) + sin(phase.z)) / 3.0;
    v_alpha = 0.35 + 0.65 * (0.5 + 0.5 * flick);
  }
  v_alpha *= keep;
}
`;

const DRAW_FRAG = `#version 300 es
precision highp float;

uniform vec3 u_color;
in float v_alpha;
out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float dist2 = dot(c, c);
  float mask = 1.0 - smoothstep(0.1225, 0.25, dist2);
  if (mask <= 0.0) discard;
  float a = v_alpha * mask;
  fragColor = vec4(u_color * a, a);
}
`;

function supportsSim(): boolean {
  const probe = document.createElement('canvas').getContext('webgl2');
  if (!probe) return false;
  const ok = !!probe.getExtension('EXT_color_buffer_float');
  probe.getExtension('WEBGL_lose_context')?.loseContext();
  return ok;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || 'Shader compile failed');
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vert: WebGLShader, frag: WebGLShader) {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(log || 'Program link failed');
  }
  return program;
}

function makeTarget(gl: WebGL2RenderingContext, w: number, h: number) {
  const tex = gl.createTexture();
  const fb = gl.createFramebuffer();
  if (!tex || !fb) throw new Error('Failed to create sim target');

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

  return { tex, fb };
}

type Target = ReturnType<typeof makeTarget>;

// Tailwind v4 palette values are oklch, which WebGL cannot take. A 2D canvas converts any CSS color to sRGB bytes.
function resolveCssColor(element: HTMLElement, colorVar: string): [number, number, number] {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return [0.5, 0.5, 0.5];
  ctx.fillStyle = getComputedStyle(element).getPropertyValue(colorVar).trim();
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export function DotField({
  className,
  colorVar = '--color-slate-400',
  density = 1
}: {
  className?: string;
  colorVar?: string;
  // Share of grid cells that draw a dot. 1 is the full grid.
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!supportsSim()) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true
    });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return;

    const simVert = compile(gl, gl.VERTEX_SHADER, SIM_VERT);
    const simFrag = compile(gl, gl.FRAGMENT_SHADER, SIM_FRAG);
    const drawVert = compile(gl, gl.VERTEX_SHADER, DRAW_VERT);
    const drawFrag = compile(gl, gl.FRAGMENT_SHADER, DRAW_FRAG);
    const simProgram = link(gl, simVert, simFrag);
    const drawProgram = link(gl, drawVert, drawFrag);

    gl.disable(gl.DEPTH_TEST);

    const sim = {
      gridOrigin: gl.getUniformLocation(simProgram, 'u_gridOrigin'),
      spacing: gl.getUniformLocation(simProgram, 'u_spacing'),
      mouse: gl.getUniformLocation(simProgram, 'u_mouse'),
      mouseActive: gl.getUniformLocation(simProgram, 'u_mouseActive'),
      radius: gl.getUniformLocation(simProgram, 'u_radius'),
      force: gl.getUniformLocation(simProgram, 'u_force'),
      spring: gl.getUniformLocation(simProgram, 'u_spring'),
      damping: gl.getUniformLocation(simProgram, 'u_damping'),
      rippleCount: gl.getUniformLocation(simProgram, 'u_rippleCount'),
      ripples: gl.getUniformLocation(simProgram, 'u_ripples'),
      rippleSpeed: gl.getUniformLocation(simProgram, 'u_rippleSpeed'),
      rippleWidth: gl.getUniformLocation(simProgram, 'u_rippleWidth'),
      rippleForce: gl.getUniformLocation(simProgram, 'u_rippleForce'),
      rippleDecay: gl.getUniformLocation(simProgram, 'u_rippleDecay'),
      prevState: gl.getUniformLocation(simProgram, 'u_prevState')
    };

    const draw = {
      resolution: gl.getUniformLocation(drawProgram, 'u_resolution'),
      gridSize: gl.getUniformLocation(drawProgram, 'u_gridSize'),
      gridOrigin: gl.getUniformLocation(drawProgram, 'u_gridOrigin'),
      spacing: gl.getUniformLocation(drawProgram, 'u_spacing'),
      time: gl.getUniformLocation(drawProgram, 'u_time'),
      dotSize: gl.getUniformLocation(drawProgram, 'u_dotSize'),
      reducedMotion: gl.getUniformLocation(drawProgram, 'u_reducedMotion'),
      state: gl.getUniformLocation(drawProgram, 'u_state'),
      color: gl.getUniformLocation(drawProgram, 'u_color'),
      density: gl.getUniformLocation(drawProgram, 'u_density')
    };

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const simVao = gl.createVertexArray();
    gl.bindVertexArray(simVao);
    const posLoc = gl.getAttribLocation(simProgram, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const drawVao = gl.createVertexArray();

    gl.useProgram(simProgram);
    gl.uniform1i(sim.prevState, 0);
    gl.uniform1f(sim.spacing, SPACING);
    gl.uniform1f(sim.radius, MOUSE_RADIUS);
    gl.uniform1f(sim.force, FORCE);
    gl.uniform1f(sim.spring, SPRING);
    gl.uniform1f(sim.damping, DAMPING);
    gl.uniform1f(sim.rippleSpeed, RIPPLE_SPEED);
    gl.uniform1f(sim.rippleWidth, RIPPLE_WIDTH);
    gl.uniform1f(sim.rippleForce, RIPPLE_FORCE);
    gl.uniform1f(sim.rippleDecay, RIPPLE_DECAY);

    gl.useProgram(drawProgram);
    gl.uniform1i(draw.state, 0);
    gl.uniform1f(draw.spacing, SPACING);
    gl.uniform3f(draw.color, ...resolveCssColor(wrap, colorVar));
    gl.uniform1f(draw.density, density);
    gl.uniform1f(draw.reducedMotion, reducedMotion ? 1 : 0);

    let cols = 1;
    let rows = 1;
    let originX = 0;
    let originY = 0;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let targets: [Target, Target] | null = null;
    let ping = 0;
    const bounds = { left: 0, top: 0, width: 0, height: 0 };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      bounds.left = rect.left;
      bounds.top = rect.top;
      bounds.width = rect.width;
      bounds.height = rect.height;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));

      originX = (cssW % SPACING) / 2 + SPACING / 2;
      originY = (cssH % SPACING) / 2 + SPACING / 2;
      cols = Math.max(1, Math.ceil((cssW + SPACING - originX) / SPACING));
      rows = Math.max(1, Math.ceil((cssH + SPACING - originY) / SPACING));

      if (targets) {
        gl.deleteFramebuffer(targets[0].fb);
        gl.deleteTexture(targets[0].tex);
        gl.deleteFramebuffer(targets[1].fb);
        gl.deleteTexture(targets[1].tex);
      }
      targets = [makeTarget(gl, cols, rows), makeTarget(gl, cols, rows)];
      ping = 0;

      gl.useProgram(simProgram);
      gl.uniform2f(sim.gridOrigin, originX, originY);
      gl.useProgram(drawProgram);
      gl.uniform2f(draw.resolution, cssW, cssH);
      gl.uniform2f(draw.gridSize, cols, rows);
      gl.uniform2f(draw.gridOrigin, originX, originY);
      gl.uniform1f(draw.dotSize, 2 * dpr + 0.5);
      measure();
    };

    resize();

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? false;
        if (next && !visible) skipClock = true;
        visible = next;
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const mouse = { x: -9999, y: -9999 };
    const smooth = { x: -9999, y: -9999 };
    let hovering = false;
    let lastMoveAt = -10;
    let lastSimAt = -100;
    let overUi = false;
    let uiCheckAt = 0;
    const ripples: { x: number; y: number; born: number }[] = [];
    const rippleData = new Float32Array(MAX_RIPPLES * 3);

    const onMove = (event: PointerEvent) => {
      if (reducedMotion) return;
      if (event.clientY < bounds.top - 150 || event.clientY > bounds.top + bounds.height + 150) {
        if (hovering) {
          mouse.x = -9999;
          mouse.y = -9999;
          hovering = false;
          overUi = false;
        }
        return;
      }

      const now = event.timeStamp;
      if (now - uiCheckAt > 100) {
        const target = event.target;
        overUi = target instanceof HTMLElement && !!target.closest(INTERACTIVE);
        uiCheckAt = now;
      }

      if (overUi) {
        mouse.x = -9999;
        mouse.y = -9999;
        hovering = false;
        return;
      }

      mouse.x = event.clientX - bounds.left;
      mouse.y = event.clientY - bounds.top;
      hovering = true;
      if (smooth.x < -9000) {
        smooth.x = mouse.x;
        smooth.y = mouse.y;
      }
      lastMoveAt = clock;
      lastSimAt = clock;
    };

    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      hovering = false;
      overUi = false;
    };

    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary || overUi || reducedMotion) return;
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;
      ripples.push({ x, y, born: clock });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      lastSimAt = clock;
    };

    const onVisibility = () => {
      if (document.hidden) lastMoveAt = -10;
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('visibilitychange', onVisibility);

    let raf = 0;
    let lastFrame = 0;
    let clock = 0;
    let skipClock = true;

    const paint = (time = 0) => {
      if (!targets) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(drawProgram);
      gl.uniform1f(draw.time, time);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[ping].tex);
      gl.bindVertexArray(drawVao);
      gl.drawArrays(gl.POINTS, 0, cols * rows);
      gl.bindVertexArray(null);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || !targets) return;

      const hasRipple = ripples.some((r) => clock - r.born < 2);
      const interacting = hovering || hasRipple || clock - lastSimAt < 2.5;

      if (skipClock) {
        lastFrame = now;
        skipClock = false;
      } else if (!interacting && now - lastFrame < 1000 / 30) {
        return;
      }

      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      clock += dt;
      measure();

      if (interacting) {
        if (hovering) {
          smooth.x += (mouse.x - smooth.x) * 0.8;
          smooth.y += (mouse.y - smooth.y) * 0.8;
        } else {
          smooth.x += (-9999 - smooth.x) * 0.08;
          smooth.y += (-9999 - smooth.y) * 0.08;
        }

        const age = clock - lastMoveAt;
        const mouseActive = hovering && age <= 1 ? Math.exp(-7 * age) : 0;

        let live = 0;
        for (let i = 0; i < ripples.length; i++) {
          const ageR = clock - ripples[i].born;
          if (ageR >= 2) continue;
          ripples[live] = ripples[i];
          if (live < MAX_RIPPLES) {
            rippleData[live * 3] = ripples[i].x;
            rippleData[live * 3 + 1] = ripples[i].y;
            rippleData[live * 3 + 2] = ageR;
          }
          live++;
        }
        ripples.length = live;
        const count = Math.min(live, MAX_RIPPLES);
        for (let i = count * 3; i < rippleData.length; i++) rippleData[i] = 0;

        const prev = targets[ping];
        const next = targets[1 - ping];
        gl.bindFramebuffer(gl.FRAMEBUFFER, next.fb);
        gl.viewport(0, 0, cols, rows);
        gl.disable(gl.BLEND);
        gl.useProgram(simProgram);
        gl.uniform2f(sim.mouse, smooth.x, smooth.y);
        gl.uniform1f(sim.mouseActive, mouseActive > 0.001 ? mouseActive : 0);
        gl.uniform1i(sim.rippleCount, count);
        gl.uniform3fv(sim.ripples, rippleData);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, prev.tex);
        gl.bindVertexArray(simVao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ping = 1 - ping;
      }

      paint(clock);
    };

    let resizing = false;
    const ro = new ResizeObserver(() => {
      if (resizing) return;
      resizing = true;
      requestAnimationFrame(() => {
        resizing = false;
        resize();
        if (reducedMotion) paint(0);
      });
    });
    ro.observe(wrap);

    if (reducedMotion) paint(0);
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteProgram(simProgram);
      gl.deleteProgram(drawProgram);
      gl.deleteShader(simVert);
      gl.deleteShader(simFrag);
      gl.deleteShader(drawVert);
      gl.deleteShader(drawFrag);
      gl.deleteBuffer(quad);
      gl.deleteVertexArray(simVao);
      gl.deleteVertexArray(drawVao);
      if (targets) {
        gl.deleteFramebuffer(targets[0].fb);
        gl.deleteTexture(targets[0].tex);
        gl.deleteFramebuffer(targets[1].fb);
        gl.deleteTexture(targets[1].tex);
      }
    };
  }, [colorVar, density]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
