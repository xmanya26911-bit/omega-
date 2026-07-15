// GLSL shaders for the Omega 3D scene.
// Kept as plain strings to avoid extra build tooling; injected via <shaderMaterial/>.

/* Classic Ashima / Stefan Gustavson 3D simplex noise — reused across shaders. */
export const SIMPLEX_NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* ── AI Core: noise-displaced fresnel shell ─────────────────────────────── */
export const CORE_VERT = /* glsl */ `
uniform float uTime;
uniform float uDisplace;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;
${SIMPLEX_NOISE}
void main(){
  vec3 pos = position;
  float n1 = snoise(pos * 1.1 + uTime * 0.22);
  float n2 = snoise(pos * 2.6 - uTime * 0.14);
  float n = n1 * 0.65 + n2 * 0.35;
  vNoise = n;
  pos += normal * n * uDisplace;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const CORE_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uColorA;   // emerald
uniform vec3 uColorB;   // amber
uniform vec3 uColorC;   // rose
uniform vec3 uCore;     // bright inner
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;
void main(){
  vec3 V = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(V, vNormal), 0.0), 2.2);
  float t = vNoise * 0.5 + 0.5;
  vec3 col = mix(uColorA, uColorB, t);
  col = mix(col, uColorC, smoothstep(0.62, 1.0, t));
  col += fres * uColorA * 1.8;
  col += uCore * (0.18 + 0.12 * (1.0 - fres));
  col *= 0.88 + 0.12 * sin(uTime * 1.3);
  float alpha = mix(0.42, 0.96, fres);
  gl_FragColor = vec4(col, alpha);
}
`;

/* ── Particle field: soft circular additive motes ───────────────────────── */
export const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
attribute vec3 aColor;
attribute float aPhase;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vColor = aColor;
  vec3 p = position;
  // gentle orbital drift
  float a = uTime * 0.06 + aPhase * 6.2831;
  p.x += sin(a) * 0.35;
  p.y += cos(a * 0.8) * 0.25;
  p.z += sin(a * 0.6) * 0.35;
  // slow vertical rise
  p.y += mod(uTime * 0.05 + aPhase * 2.0, 8.0) - 4.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float dist = -mv.z;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / dist) * 300.0;
  gl_Position = projectionMatrix * mv;
  vAlpha = 0.55 + 0.45 * sin(uTime * 0.9 + aPhase * 9.0);
}
`;

export const PARTICLE_FRAG = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

/* ── Energy ring: pulsing torus shell ───────────────────────────────────── */
export const RING_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vViewPos;
void main(){
  vec3 V = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(V, vNormal), 0.0), 1.6);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.8);
  vec3 col = uColor * (0.4 + fres * 1.6) * (0.7 + 0.3 * pulse);
  gl_FragColor = vec4(col, 0.35 + fres * 0.4);
}
`;

export const RING_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPos;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
