// Five visible positions: two left panels, the main panel and two right panels.
export const featuredIndex = 2;
// The three left-facing faces lie on one projected plane. Their upper/lower edges
// extend to the same vanishing point instead of making four independent fans.
export const leftVanishingPoint = [-285,273];
const frontRight = 671;
const topLine = x => 273*(frontRight-x)/(frontRight+285);
const bottomLine = x => 273+(532-273)*(x+285)/(frontRight+285);
function leftSlot(x,w,edgeWidth) {
  const right=x+w-edgeWidth;
  const y=topLine(right),h=bottomLine(right)-y;
  const f=(w-edgeWidth)/w;
  return {x,y,w,h,face:[[0,(topLine(x)-y)/h],[f,0],[f,1],[0,(bottomLine(x)-y)/h]],edge:[[f,0],[1,.013],[1,.992],[f,1]]};
}
const innerRight={ x:691, y:0, w:145, h:416, face:[[.06,0],[1,.122],[1,.888],[.06,1]], edge:[[0,.016],[.06,0],[.06,1],[0,.99]] };
const outerRight={ x:850, y:0, w:132, h:326, face:[[.065,0],[1,.141],[1,.885],[.065,1]], edge:[[0,.018],[.065,0],[.065,1],[0,.988]] };
// Both right panels share continuous top and bottom perspective lines.
// Trim the outer panel's lower edge while retaining its approved top diagonal.
const rightFaceWidth=innerRight.w*(1-innerRight.face[0][0]);
const rightTopSlope=innerRight.h*innerRight.face[1][1]/rightFaceWidth;
const rightBottomSlope=innerRight.h*(innerRight.face[2][1]-innerRight.face[3][1])/rightFaceWidth;
const rightTopStart=innerRight.x+innerRight.w*innerRight.face[0][0];
const outerRightOffset=outerRight.x+outerRight.w*outerRight.face[0][0]-rightTopStart;
outerRight.y=innerRight.y+rightTopSlope*outerRightOffset;
outerRight.h=innerRight.y+innerRight.h+rightBottomSlope*outerRightOffset-outerRight.y;
outerRight.face[1][1]=rightTopSlope*outerRight.w*(1-outerRight.face[0][0])/outerRight.h;
outerRight.face[2][1]=1+rightBottomSlope*outerRight.w*(1-outerRight.face[0][0])/outerRight.h;
export const slots = [
  leftSlot(150,128,7.7),
  leftSlot(288,143,7.9),
  leftSlot(447,230,6),
  innerRight,
  outerRight,
];

export const modulo = (value, total) => ((value % total) + total) % total;
export const unitFace = [[0,0],[1,0],[1,1],[0,1]];

export function visibleCategories(selected, total, count=slots.length, featured=featuredIndex) {
  return Array.from({length:count}, (_,index) => modulo(selected+index-featured,total));
}

export function transformPoint(matrix, [x,y]) {
  const depth=matrix[3]*x+matrix[7]*y+matrix[15];
  return [(matrix[0]*x+matrix[4]*y+matrix[12])/depth,
          (matrix[1]*x+matrix[5]*y+matrix[13])/depth];
}

// The photo travels across the panel's local plane, under an immobile mask.
// Both photos share the exact same seam throughout a turn, without fading.
export function translatedFace(frame, offset) {
  const matrix=projectiveTransform(unitFace,frame);
  return unitFace.map(([x,y]) => transformPoint(matrix,[x+offset,y]));
}

// Reproject a photograph from its original quadrilateral into a fixed panel face.
// Keeping the source image intact avoids stretching its original panel silhouette.
export function projectiveTransform(source, target) {
  const rows = source.flatMap(([x, y], index) => {
    const [u, v] = target[index];
    return [[x, y, 1, 0, 0, 0, -u*x, -u*y, u],
            [0, 0, 0, x, y, 1, -v*x, -v*y, v]];
  });
  for (let column = 0; column < 8; column++) {
    let pivot = column;
    for (let row = column + 1; row < 8; row++) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    if (Math.abs(divisor) < 1e-10) throw new Error('Degenerate panel projection');
    for (let i = column; i <= 8; i++) rows[column][i] /= divisor;
    for (let row = 0; row < 8; row++) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let i = column; i <= 8; i++) rows[row][i] -= factor * rows[column][i];
    }
  }
  const [a,b,c,d,e,f,g,h] = rows.map(row => row[8]);
  // A homography and any nonzero scalar multiple have the same 2D result.
  // CSS also clips against homogeneous camera depth: normalizing at the image
  // origin put some photograph faces behind that plane after a carousel turn.
  const center = source.reduce(([x,y], point) => [x+point[0]/4,y+point[1]/4], [0,0]);
  const depth = g*center[0] + h*center[1] + 1;
  if (Math.abs(depth) < 1e-10) throw new Error('Invalid panel camera depth');
  return [a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1].map(value => value/depth);
}


// Fixed camera; complete panel bodies move between the five visible positions.
export const camera={x:500,y:273,focal:1100};
const mix=(a,b,t)=>a+(b-a)*t;
export function project3D([x,y,z]) {
  return [camera.x+camera.focal*x/z,camera.y-camera.focal*y/z];
}

export function poseFromSlot(slot) {
  const face=slot.face.map(([x,y])=>[slot.x+x*slot.w,slot.y+y*slot.h]);
  function edgeCenter(top,bottom) {
    const depth=camera.focal*2/(bottom[1]-top[1]);
    return [(top[0]-camera.x)*depth/camera.focal,
            (camera.y-(top[1]+bottom[1])/2)*depth/camera.focal,depth];
  }
  const left=edgeCenter(face[0],face[3]);
  const right=edgeCenter(face[1],face[2]);
  const delta=right.map((v,i)=>v-left[i]);
  const width=Math.hypot(delta[0],delta[2]);
  const yaw=Math.atan2(delta[2],delta[0]);
  const pose={center:left.map((v,i)=>(v+right[i])/2),width,height:2,yaw,shear:delta[1]/width,thickness:.045};
  // Match the already-approved right edges and the reference's wooden thickness.
  const edge=yaw<0?right:left;
  const backX=yaw<0?slot.x+slot.w:slot.x;
  const normal=[-Math.sin(yaw),0,Math.cos(yaw)];
  const q=backX-camera.x;
  pose.thickness=(camera.focal*edge[0]-q*edge[2])/(q*normal[2]-camera.focal*normal[0]);
  return pose;
}

export const poses=slots.map(poseFromSlot);
// One body waits behind the display so all six catalogue images remain in the
// loop while only five panels are shown. Every photograph stays on its body.
export const ringPoses=[...poses,{
  ...poses[featuredIndex],
  center:[poses[featuredIndex].center[0],poses[featuredIndex].center[1],Math.max(...poses.map(pose=>pose.center[2]))+11],
  yaw:-Math.PI,
}];
export function interpolatePose(from,to,amount,wrapDirection=0) {
  let rotation=to.yaw-from.yaw;
  if(wrapDirection) rotation-=wrapDirection*2*Math.PI;
  else rotation=Math.atan2(Math.sin(rotation),Math.cos(rotation));
  const center=from.center.map((value,i)=>mix(value,to.center[i],amount));
  if(wrapDirection)center[2]+=Math.sin(Math.PI*amount)*11;
  return {
    center,width:mix(from.width,to.width,amount),height:mix(from.height,to.height,amount),
    yaw:from.yaw+rotation*amount,shear:mix(from.shear,to.shear,amount),
    thickness:mix(from.thickness,to.thickness,amount),
  };
}

export function panelSurfaces(pose) {
  const horizontal=[Math.cos(pose.yaw),pose.shear,Math.sin(pose.yaw)];
  const rear=[-Math.sin(pose.yaw)*pose.thickness,0,Math.cos(pose.yaw)*pose.thickness];
  const front=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>
    pose.center.map((v,i)=>v+horizontal[i]*x*pose.width/2+(i===1?y*pose.height/2:0)));
  const back=front.map(point=>point.map((v,i)=>v+rear[i]));
  const faces=[
    {kind:'front',points:front},
    {kind:'back',points:[back[1],back[0],back[3],back[2]]},
    {kind:'right',points:[front[1],back[1],back[2],front[2]]},
    {kind:'left',points:[back[0],front[0],front[3],back[3]]},
    {kind:'top',points:[back[0],back[1],front[1],front[0]]},
    {kind:'bottom',points:[front[3],front[2],back[2],back[3]]},
  ];
  return faces.map(face=>{
    const a=face.points[1].map((v,i)=>v-face.points[0][i]);
    const b=face.points[2].map((v,i)=>v-face.points[0][i]);
    const normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const facing=-normal.reduce((sum,v,i)=>sum+v*face.points[0][i],0);
    return {...face,visible:facing>1e-7,projected:face.points.map(project3D)};
  });
}

// Silhouette of a convex solid, independent of category or turn count.
export function convexHull(points) {
  const sorted=[...new Map(points.map(point=>[point.join(','),point])).values()]
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  if(sorted.length<3)return sorted;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const chain=sequence=>{
    const hull=[];
    for(const point of sequence){
      while(hull.length>1&&cross(hull[hull.length-2],hull[hull.length-1],point)<=0)hull.pop();
      hull.push(point);
    }
    return hull.slice(0,-1);
  };
  return [...chain(sorted),...chain(sorted.slice().reverse())];
}
