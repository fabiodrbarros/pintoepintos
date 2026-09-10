import { projectiveTransform } from './geometry.mjs';

const vertexSource=`
  attribute vec2 a_source;
  uniform mat3 u_projection;
  uniform vec2 u_viewport;
  uniform vec2 u_image_size;
  varying vec2 v_uv;
  void main(){
    vec3 p=u_projection*vec3(a_source,1.0);
    gl_Position=vec4(2.0*p.x/u_viewport.x-p.z,p.z-2.0*p.y/u_viewport.y,0.0,p.z);
    v_uv=a_source/u_image_size;
  }
`;
const fragmentSource=`
  precision highp float;
  uniform sampler2D u_image;
  uniform vec2 u_image_size;
  uniform float u_opacity;
  uniform float u_brightness;
  varying vec2 v_uv;
  float cubic(float x){
    x=abs(x);
    if(x<1.0)return (1.5*x-2.5)*x*x+1.0;
    if(x<2.0)return ((-0.5*x+2.5)*x-4.0)*x+2.0;
    return 0.0;
  }
  void main(){
    // Reconstruct the unchanged source photograph smoothly at device pixels.
    // Catmull-Rom sampling retains grain without nearest-pixel blocks or blur.
    vec2 pixel=v_uv*u_image_size-0.5;
    vec2 base=floor(pixel);
    vec2 fraction=pixel-base;
    vec4 color=vec4(0.0);
    for(int y=0;y<4;y++){
      for(int x=0;x<4;x++){
        vec2 offset=vec2(float(x-1),float(y-1));
        vec2 uv=(base+offset+0.5)/u_image_size;
        color+=texture2D(u_image,uv)*cubic(offset.x-fraction.x)*cubic(offset.y-fraction.y);
      }
    }
    color=clamp(color,0.0,1.0);
    gl_FragColor=vec4(color.rgb*u_brightness,color.a*u_opacity);
  }
`;

const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<.01;
// Joined quarters share one photographic face. This removes antialiased seams
// while allowing the same pieces to separate naturally on the scroll timeline.
export function mergePhotographicFaces(faces){
  const result=[];
  const fronts=new Map();
  for(const face of faces){
    const previous=fronts.get(Math.floor(face.index/4));
    if(face.mergeable&&previous&&previous.lastIndex===face.index-1&&
       close(previous.target[1],face.target[0])&&close(previous.target[2],face.target[3])&&
       close(previous.source[1],face.source[0])&&close(previous.source[2],face.source[3])){
      previous.target=[previous.target[0],face.target[1],face.target[2],previous.target[3]];
      previous.source=[previous.source[0],face.source[1],face.source[2],previous.source[3]];
      previous.depth=(previous.depth*previous.count+face.depth)/(previous.count+1);
      previous.count++;previous.lastIndex=face.index;
    }else{
      const entry={...face,count:1,lastIndex:face.index};
      result.push(entry);
      if(face.mergeable)fronts.set(Math.floor(face.index/4),entry);
    }
  }
  return result;
}

export function drawingSize(width,height,pixelRatio){
  const density=Math.min(3,Math.max(1,pixelRatio||1));
  return [Math.max(1,Math.round(width*density)),Math.max(1,Math.round(height*density))];
}

export class PhotographicPanels {
  constructor(world,images){
    this.available=false;
    this.destroyed=false;
    this.textures=[];
    this.shaders=[];
    this.faces=[];
    this.canvas=document.createElement('canvas');
    this.canvas.className='photographic-panels';
    this.canvas.setAttribute('aria-hidden','true');
    const gl=this.canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});
    this.gl=gl;
    if(!gl){this.loaded=Promise.resolve();return;}
    this.loaded=this.initialize(images).catch(()=>this.destroy());
    this.canvas.addEventListener('webglcontextlost',event=>{
      if(this.destroyed)return;
      event.preventDefault();this.available=false;this.canvas.hidden=true;
      dispatchEvent(new Event('resize'));
    });
    world.append(this.canvas);
  }
  async initialize(images){
    const gl=this.gl;
    const shader=(kind,source)=>{
      const value=gl.createShader(kind);this.shaders.push(value);gl.shaderSource(value,source);gl.compileShader(value);
      if(!gl.getShaderParameter(value,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(value));
      return value;
    };
    const vertex=shader(gl.VERTEX_SHADER,vertexSource),fragment=shader(gl.FRAGMENT_SHADER,fragmentSource);
    const program=gl.createProgram();this.program=program;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vertex);gl.deleteShader(fragment);this.shaders=[];
    this.program=program;
    this.uniforms=Object.fromEntries(['projection','viewport','image_size','image','opacity','brightness'].map(name=>[name,gl.getUniformLocation(program,'u_'+name)]));
    this.buffer=gl.createBuffer();this.attribute=gl.getAttribLocation(program,'a_source');
    this.images=Object.fromEntries(await Promise.all(Object.entries(images).map(async([name,source])=>{
      const image=new Image();image.src=source.src;await image.decode();
      if(this.destroyed)throw new Error('Renderer disposed');
      const texture=gl.createTexture();this.textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      return [name,{texture,width:image.naturalWidth,height:image.naturalHeight}];
    })));
    if(this.destroyed)return;
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    this.available=true;
  }
  destroy(){
    if(this.destroyed)return;
    this.destroyed=true;this.available=false;
    const gl=this.gl;
    if(gl){
      for(const texture of this.textures)gl.deleteTexture(texture);
      for(const shader of this.shaders)gl.deleteShader(shader);
      if(this.buffer)gl.deleteBuffer(this.buffer);
      if(this.program)gl.deleteProgram(this.program);
    }
    this.faces=[];this.images={};this.textures=[];this.shaders=[];
    this.canvas.remove();
  }
  begin(width,height,opacity,pixelRatio){
    if(!this.available)return false;
    const gl=this.gl,[w,h]=drawingSize(width,height,pixelRatio);
    this.canvas.hidden=opacity<=0;
    this.canvas.style.opacity=opacity;
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    gl.enableVertexAttribArray(this.attribute);
    gl.vertexAttribPointer(this.attribute,2,gl.FLOAT,false,0,0);
    gl.uniform2f(this.uniforms.viewport,width,height);
    gl.activeTexture(gl.TEXTURE0);gl.uniform1i(this.uniforms.image,0);
    this.faces=[];
    return true;
  }
  add(face){this.faces.push(face);}
  finish(){
    if(!this.available||this.canvas.hidden)return;
    const gl=this.gl,u=this.uniforms;
    const faces=mergePhotographicFaces(this.faces).sort((a,b)=>b.depth-a.depth||a.index-b.index||a.layer-b.layer);
    for(const face of faces){
      const image=this.images[face.image];
      const m=projectiveTransform(face.source,face.target);
      gl.uniformMatrix3fv(u.projection,false,new Float32Array([m[0],m[1],m[3],m[4],m[5],m[7],m[12],m[13],m[15]]));
      gl.uniform2f(u.image_size,image.width,image.height);
      gl.uniform1f(u.opacity,face.opacity);gl.uniform1f(u.brightness,face.brightness);
      gl.bindTexture(gl.TEXTURE_2D,image.texture);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,1,2,0,2,3].flatMap(i=>face.source[i])),gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES,0,6);
    }
  }
}
