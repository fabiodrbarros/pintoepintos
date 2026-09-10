import { projectiveTransform, transformPoint } from './geometry.mjs';
import { shelfPhotography, logoPhoto, referenceFaces, referenceEdges } from './photography.mjs';
export { shelfPhotography, logoPhoto };

export const design={width:1887,height:939};
export const camera={x:943.5,y:180,focal:1700};
export const clamp=value=>Math.min(1,Math.max(0,value));
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=value=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10);};
export const segment=(progress,from,to)=>smooth((progress-from)/(to-from));

// Preserve the approved first two chapters, then leave room for the catalogue.
export const earlyProgress=progress=>clamp(progress/.75);
export const shelfProgress=progress=>mix(.625,1,clamp((progress-.815)/.185));
export const catalogVisibility=progress=>segment(progress,.535,.605)*(1-segment(progress,.755,.805));
export const catalogIsInteractive=progress=>progress>=.615&&progress<=.755;
export const catalogCardSize=portrait=>portrait?{width:200,height:320}:{width:220,height:420};

// Bring the faces together while retaining the brand's continuous diagonals.
export const logoOutline=[
  [[22,40.0833333333],[58,27.0833333333],[58,103.0833333333],[22,92.0833333333]],
  [[61,26],[97,13],[97,115],[61,104]],
  [[100,17],[128,30],[128,74],[100,84]],
];
// Translate whole panels only. These offsets restore the reference's clear
// gaps (about 19/255 and 15/255 of the central face width), including thickness.
const panelSpacing=[-6.6,0,13.2];
// Lift the right panel intact until its highest corner meets the central one.
const panelRise=[0,0,-24];
export const logoFaces=logoOutline.map((face,index)=>face.map(([x,y])=>[660+(x-17)*6+panelSpacing[index],114+(y-13)*6+panelRise[index]]));

// The opened strips share the actual logo's continuous perspective lines.
const lightTop=x=>13+(97-x)*13/36;
const lightBottom=x=>115-(97-x)*11/36;
const rightTop=x=>17+(x-100)*13/28;
const rightBottom=x=>84-(x-100)*10/28;
const rightFanRise=(13-rightTop(99.4))*6.4;
const fanRise=-20;
const fanFaces=[
  // A wider opening leaves daylight between the central pieces after their
  // wooden thickness is included. Keep the shared top/bottom perspective lines.
  ...[[17.8,34.3],[38.7,55.2],[59.6,76.1],[80.5,97]].map(([a,b])=>[[a,lightTop(a)],[b,lightTop(b)],[b,lightBottom(b)],[a,lightBottom(a)]]),
  ...[[99.4,111.4],[113.8,125.8]].map(([a,b])=>[[a,rightTop(a)],[b,rightTop(b)],[b,rightBottom(b)],[a,rightBottom(a)]]),
].map((face,index)=>face.map(([x,y])=>[200+(x-17)*6.4+(index>=4?25:0),115+(y-13)*6.4+fanRise+(index>=4?rightFanRise:0)]));

export function poseFromFace(face,thickness=.04,height=2){
  function edge(top,bottom){
    const z=camera.focal*height/(bottom[1]-top[1]);
    return [(top[0]-camera.x)*z/camera.focal,(camera.y-(top[1]+bottom[1])/2)*z/camera.focal,z];
  }
  const a=edge(face[0],face[3]),b=edge(face[1],face[2]),delta=b.map((v,i)=>v-a[i]);
  const width=Math.hypot(delta[0],delta[2]);
  return {center:a.map((v,i)=>(v+b[i])/2),width,height,yaw:Math.atan2(delta[2],delta[0]),roll:0,shear:delta[1]/width,thickness};
}

function slicePose(pose,index,count){
  const offset=((index+.5)/count-.5)*pose.width;
  const direction=[Math.cos(pose.yaw),pose.shear,Math.sin(pose.yaw)];
  return {...pose,width:pose.width/count,center:pose.center.map((v,i)=>v+direction[i]*offset)};
}

const split=(pose,count)=>Array.from({length:count},(_,i)=>slicePose(pose,i,count));
// The twelve bodies form three seamless faces, then six panels, then twelve samples.
const origin=logoFaces.flatMap(face=>split(poseFromFace(face),4));
const arrived=logoFaces.flatMap(face=>{
  const moved=face.map(([x,y])=>[1010+(x-1010)*.88-390,443+(y-443)*.88+78]);
  return split(poseFromFace(moved,.045),4);
});
const opened=fanFaces.flatMap(face=>split(poseFromFace(face,.045),2));

// Six upright panels in one horizontal row. On portrait screens the same six
// panels wrap into two rows so the engraved names remain readable.
function catalogFace(index,portrait){
  const {width,height}=catalogCardSize(portrait);
  const x=portrait?609.5+(index%3)*234:208.5+index*250;
  const y=portrait?180+Math.floor(index/3)*368:270;
  return [[x,y],[x+width,y],[x+width,y+height],[x,y+height]];
}
function catalogPerspectivePose(index,portrait){
  const face=catalogFace(index,portrait);
  const base=poseFromFace(face,portrait?.12:.17);
  const yaw=portrait?-.40:-.60,co=Math.cos(yaw),si=Math.sin(yaw);
  // Turn the actual solid, keeping the two projected vertical edges inside
  // its existing slot. The visible side grain occupies the remaining gap.
  const left=(face[0][0]+7-camera.x)/camera.focal;
  const right=(face[1][0]-15-camera.x)/camera.focal;
  const z=base.center[2];
  const width=(right-left)*z/(co-si*(right+left)/2);
  const halfDepth=si*width/2;
  const x=left*(z-halfDepth)+co*width/2;
  const y=base.center[1]*(1-halfDepth*halfDepth/(z*z));
  return {...base,center:[x,y,z],width,yaw};
}
const catalogWholePoses=[false,true].map(portrait=>
  Array.from({length:6},(_,index)=>catalogPerspectivePose(index,portrait)));
const catalogPoses=catalogWholePoses.map(poses=>poses.flatMap(pose=>split(pose,2)));
const expandedCatalogPoses=catalogPoses.map(poses=>poses.map(pose=>({
  ...pose,center:pose.center.map((value,index)=>index===2?value*.87:value),
})));

function catalogHoverPose(index,portrait,amount){
  const base=catalogWholePoses[portrait?1:0][Math.floor(index/2)];
  const z=base.center[2]-.42*amount,ratio=z/base.center[2];
  const moved={...base,center:[base.center[0]*ratio,base.center[1]*ratio+.045*amount,z],yaw:base.yaw-.035*amount};
  // Move and rotate the complete board before slicing it. Both halves and
  // their continuous photographic grain must share the same pivot.
  return slicePose(moved,index%2,2);
}

// Refine the supplied natural-wood reference. A single photographic face spans
// each original face; adjacent quarters share UV seams without repeating grain.
const unit=[[0,0],[1,0],[1,1],[0,1]];
export const logoTextures=referenceFaces.flatMap(face=>{
  const matrix=projectiveTransform(unit,face);
  return Array.from({length:4},(_,i)=>unit.map(([u,v])=>transformPoint(matrix,[(i+u)/4,v])));
});
export const logoEdgeTextures=referenceEdges.flatMap(edge=>Array.from({length:4},()=>edge));

const sample=(_left,_right,index)=>({front:shelfPhotography.fronts[index],grain:shelfPhotography.fronts[index],top:shelfPhotography.fronts[index]});
export const materials=[
  {name:'Carvalho',description:'Um tom dourado e um veio bem marcado. A textura dá presença à madeira e valoriza os detalhes de cada peça.',appearance:'Dourado · veio marcado',...sample(165,244,0)},
  {name:'Castanho',description:'Tons claros e quentes, atravessados por linhas suaves. Uma presença discreta, com a naturalidade da madeira à vista.',appearance:'Mel claro · textura suave',...sample(254,334,1)},
  {name:'Afzélia',description:'Uma cor quente, entre o mel e o castanho avermelhado. O veio fino percorre a superfície e revela pequenas variações de tom.',appearance:'Castanho quente · veio fino',...sample(344,422,2)},
  {name:'Sucupira',description:'Castanhos intensos com traços mais claros e irregulares. Uma textura rica em contraste, que se descobre ao olhar de perto.',appearance:'Castanho intenso · textura contrastada',...sample(432,509,3)},
  {name:'Nogueira',description:'Veios expressivos e nuances de castanho. O desenho natural da superfície dá profundidade e torna cada amostra distinta.',appearance:'Castanho · veio expressivo',...sample(516,595,4)},
  {name:'Ipê',description:'Um castanho profundo com nuances douradas. As linhas do veio atravessam a peça e dão movimento à superfície.',appearance:'Castanho profundo · nuances douradas',...sample(608,685,5)},
  {name:'Wengé',description:'Uma tonalidade escura, atravessada por linhas finas. O contraste acentua o veio e dá uma presença mais intensa à peça.',appearance:'Escuro · linhas finas',...sample(695,770,6)},
  {name:'Iroko',description:'Tons de mel e castanho dourado, com uma textura de grão visível. A cor traz calor à composição e combina com outros tons naturais.',appearance:'Mel dourado · grão visível',...sample(784,858,7)},
  {name:'Sapeli',description:'Um castanho quente, com notas avermelhadas e linhas alongadas. A cor destaca-se numa composição de tons naturais.',appearance:'Avermelhado · linhas alongadas',...sample(873,947,8)},
  {name:'Padouk',description:'Uma cor avermelhada marcada, com nuances de cobre. O veio acompanha o comprimento da amostra e reforça a intensidade do tom.',appearance:'Cobre avermelhado · veio longitudinal',...sample(963,1033,9)},
  {name:'Cumaru',description:'Uma mistura de castanhos, com linhas claras sobre um fundo mais escuro. O desenho alongado torna a textura bem presente.',appearance:'Castanho · linhas claras',...sample(1046,1114,10)},
  {name:'Tola',description:'Uma tonalidade clara e luminosa, com um desenho delicado. A sua superfície traz leveza à composição.',appearance:'Claro · desenho delicado',...sample(1138,1205,11)},
];

const shelved=shelfPhotography.frames.map(frame=>{
  const p=shelfPhotography;
  return poseFromFace(frame.map(([x,y])=>[p.x+x*p.scale,p.y+y*p.scale]),.045);
});

export function interpolatePose(a,b,t){
  const rotation=Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw));
  return {center:a.center.map((v,i)=>mix(v,b.center[i],t)),width:mix(a.width,b.width,t),height:mix(a.height,b.height,t),yaw:a.yaw+rotation*t,roll:mix(a.roll||0,b.roll||0,t),shear:mix(a.shear,b.shear,t),thickness:mix(a.thickness,b.thickness,t)};
}

export function panelPose(index,progress,portrait=false,hover=0){
  const panel=Math.floor(index/2);
  const early=earlyProgress(progress);
  let pose=interpolatePose(origin[index],arrived[index],segment(early,.075,.28));
  // Open during the approach: every panel is open before the text arrives at .28.
  pose=interpolatePose(pose,opened[index],segment(early,.085+panel*.003,.245+panel*.003));
  const row=catalogPoses[portrait?1:0],expanded=expandedCatalogPoses[portrait?1:0];
  const lift=clamp(hover)*catalogVisibility(progress);
  const destination=lift>0?catalogHoverPose(index,portrait,lift):row[index];
  pose=interpolatePose(pose,destination,segment(progress,.455+panel*.004,.595+panel*.004));
  pose=interpolatePose(pose,expanded[index],segment(progress,.765,.825));
  return interpolatePose(pose,shelved[index],segment(shelfProgress(progress),.625+(11-index)*.0025,.915+(11-index)*.0025));
}

// The engraving stays attached to the whole front face, including perspective.
export function catalogFaceAt(index,progress,portrait=false,hover=0){
  const first=surfaces(panelPose(index*2,progress,portrait,hover))[0].points.map(project);
  const second=surfaces(panelPose(index*2+1,progress,portrait,hover))[0].points.map(project);
  return [first[0],second[1],second[2],first[3]];
}

export function inspectionPose(index,progress,amount,portrait=false){
  const resting=panelPose(index,progress),z=resting.center[2]-2.35;
  const focusX=portrait?943.5:805,focusY=portrait?500:514;
  const held={...resting,center:[(focusX-camera.x)*z/camera.focal,(camera.y-focusY)*z/camera.focal,z],yaw:-.20,roll:-.025,shear:0};
  // First leave the slot, then drift into the inspection position.
  const forward={...resting,center:[...resting.center]};
  forward.center[2]-=.9*segment(amount,0,.35);
  forward.center[1]+=.12*segment(amount,0,.35);
  return interpolatePose(forward,held,segment(amount,.18,1));
}

export function surfaces(pose){
  const horizontal=[Math.cos(pose.yaw),pose.shear,Math.sin(pose.yaw)];
  const rear=[-Math.sin(pose.yaw)*pose.thickness,0,Math.cos(pose.yaw)*pose.thickness];
  const c=Math.cos(pose.roll||0),s=Math.sin(pose.roll||0);
  const orient=([x,y,z])=>[c*x-s*y,s*x+c*y,z];
  const front=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>{
    const local=orient(horizontal.map((v,i)=>v*x*pose.width/2+(i===1?y*pose.height/2:0)));
    return pose.center.map((v,i)=>v+local[i]);
  });
  const depth=orient(rear),back=front.map(p=>p.map((v,i)=>v+depth[i]));
  return [
    {kind:'front',points:front},{kind:'back',points:[back[1],back[0],back[3],back[2]]},
    {kind:'right',points:[front[1],back[1],back[2],front[2]]},{kind:'left',points:[back[0],front[0],front[3],back[3]]},
    {kind:'top',points:[back[0],back[1],front[1],front[0]]},{kind:'bottom',points:[front[3],front[2],back[2],back[3]]},
  ].map(face=>{
    const a=face.points[1].map((v,i)=>v-face.points[0][i]),b=face.points[2].map((v,i)=>v-face.points[0][i]);
    const normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    return {...face,visible:-normal.reduce((sum,v,i)=>sum+v*face.points[0][i],0)>1e-7};
  });
}

export const project=([x,y,z])=>[camera.x+camera.focal*x/z,camera.y-camera.focal*y/z];
export function viewport(width,height,progress){
  const portrait=width<760&&height>width;
  if(portrait){
    const early=earlyProgress(progress),late=shelfProgress(progress);
    const move=segment(early,.075,.28),open=segment(early,.085,.26),shelf=segment(late,.63,.94);
    const catalog=segment(progress,.455,.615)*(1-segment(progress,.815,.97));
    const shelfCenter=shelfPhotography.x+shelfPhotography.width*shelfPhotography.scale/2;
    let focus=mix(1010,620,move);focus=mix(focus,570,open);focus=mix(focus,943.5,catalog);focus=mix(focus,shelfCenter,shelf);
    const scale=mix(width/1160,width/760,catalog);
    return {scale,x:width*.5-focus*scale,y:mix(height*.64-450*scale,height*.60-524*scale,catalog)};
  }
  const scale=Math.min(width/design.width,height/design.height);
  return {scale,x:(width-design.width*scale)/2,y:(height-design.height*scale)/2};
}
