// Native image coordinates. Raster assets are preserved intact; these outlines
// make each photographic sample independently selectable over the existing room.
const items=[
  [[85,246],[198,246],[198,620],[186,633],[70,633],[70,258]],
  [[222,246],[332,246],[333,620],[323,633],[208,633],[208,258]],
  [[356,246],[470,246],[470,620],[461,633],[344,633],[344,258]],
  [[493,246],[606,246],[607,621],[600,633],[482,633],[482,258]],
  [[630,246],[743,246],[743,623],[737,633],[621,633],[621,258]],
  [[763,246],[876,246],[876,627],[874,633],[758,633],[758,258]],
  [[896,246],[1009,246],[1013,258],[1013,633],[894,633],[894,258]],
  [[1030,246],[1145,246],[1151,258],[1151,633],[1035,633],[1030,621]],
  [[1167,246],[1280,246],[1289,258],[1289,633],[1173,633],[1166,621]],
  [[1304,246],[1419,246],[1427,258],[1427,633],[1310,633],[1304,621]],
  [[1442,246],[1558,246],[1568,258],[1568,633],[1450,633],[1441,621]],
  [[1580,246],[1690,246],[1703,258],[1703,633],[1590,633],[1580,621]],
];
const frames=items.map(points=>{
  const x=points.map(p=>p[0]),y=points.map(p=>p[1]);
  return [[Math.min(...x),Math.min(...y)],[Math.max(...x),Math.min(...y)],[Math.max(...x),Math.max(...y)],[Math.min(...x),Math.max(...y)]];
});
const frontEdges=[[74,186],[211,322],[347,461],[485,599],[623,736],[761,873],[898,1011],[1037,1148],[1174,1286],[1312,1424],[1452,1565],[1591,1700]];
export const shelfPhotography={
  src:new URL('./assets/shelf-photo-v2.png', import.meta.url).href,width:1774,height:887,
  x:700,y:245,scale:1050/1774,inspectionX:1210,
  items,frames,
  fronts:frontEdges.map(([a,b])=>[[a,260],[b,260],[b,631],[a,631]]),
  ledge:[[72,609],[1706,609],[1741,649],[1741,714],[1739,716],[33,716],[31,714],[31,649]],
  repair:{sourceTop:637,sourceBottom:646,targetTop:609,targetBottom:636},
};

// Use the client's latest reference image directly, including its grain,
// warm light and wooden edges. The established animation geometry is intact.
export const logoPhoto={src:new URL('./assets/wood-logo-reference.png', import.meta.url).href,width:1672,height:941};
export const referenceFaces=[
  [[421,380],[691,221],[689,700],[420,612]],
  [[744,196],[996,54],[995,797],[743,717]],
  [[1078,111],[1339,264],[1339,507],[1076,609]],
];
// Matching side grain from the same reference; no flat-color replacement.
export const referenceEdges=[
  [[698,220],[718,229],[718,697],[697,702]],
  [[1004,54],[1028,69],[1028,793],[1003,797]],
  [[1049,119],[1071,108],[1071,609],[1049,608]],
];
