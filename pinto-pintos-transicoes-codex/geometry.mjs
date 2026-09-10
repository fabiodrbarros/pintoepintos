// Projection helpers used by the approved section transition.

export function transformPoint(matrix, [x,y]) {
  const depth=matrix[3]*x+matrix[7]*y+matrix[15];
  return [(matrix[0]*x+matrix[4]*y+matrix[12])/depth,
          (matrix[1]*x+matrix[5]*y+matrix[13])/depth];
}

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
