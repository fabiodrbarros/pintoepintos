import { projectiveTransform } from './geometry.mjs';
import { mix, segment } from './choreography.mjs';

let shelfInstance=0;
const ns='http://www.w3.org/2000/svg';
const polygon=points=>`polygon(${points.map(([x,y])=>`${x*100}% ${y*100}%`).join(',')})`;
const bounds=points=>({left:Math.min(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),width:Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),height:Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]))});
const svgMask=(config,shapes)=>{
  const points=shapes.map(shape=>`<polygon points="${shape.map(([x,y])=>`${x},${y}`).join(' ')}"/>`).join('');
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">${points}</svg>`)}")`;
};

export const sampleAtRest=(c,index)=>c.frames[index].map(([x,y])=>[c.x+x*c.scale,c.y+y*c.scale]);
export function sampleInHand(config,index,amount,portrait){
  const original=sampleAtRest(config,index);
  const center=original.reduce(([x,y],p)=>[x+p[0]/4,y+p[1]/4],[0,0]);
  const drift=segment(amount,.12,1),scale=mix(1,1.7,segment(amount,0,.85));
  const focusX=portrait?config.x+config.width*config.scale/2:config.inspectionX;
  const x=mix(center[0],focusX,drift);
  const y=mix(center[1],530,drift)-18*Math.sin(Math.PI*amount);
  const angle=-.035*segment(amount,.2,1),co=Math.cos(angle),si=Math.sin(angle);
  return original.map(([px,py])=>{
    const dx=(px-center[0])*scale,dy=(py-center[1])*scale;
    return [x+dx*co-dy*si,y+dx*si+dy*co];
  });
}

export class PhotographicShelf {
  constructor(world,config){
    this.config=config;
    const prefix=`pinto-shelf-${++shelfInstance}`;
    this.element=document.createElement('div');
    this.element.className='photographic-shelf';
    this.element.setAttribute('aria-hidden','true');
    this.element.style.width=`${config.width}px`;
    this.element.style.height=`${config.height}px`;
    this.surface=document.createElement('div');this.surface.className='photographic-shelf-surface';
    const definitions=document.createElementNS(ns,'svg');
    this.definitions=definitions;
    definitions.classList.add('mask-definitions');
    definitions.setAttribute('width','0');definitions.setAttribute('height','0');
    const defs=document.createElementNS(ns,'defs');definitions.append(defs);
    const mask=(id,rule='evenodd')=>{
      const clip=document.createElementNS(ns,'clipPath');
      clip.id=id;clip.setAttribute('clipPathUnits','objectBoundingBox');
      const path=document.createElementNS(ns,'path');
      path.setAttribute('clip-rule',rule);path.setAttribute('fill-rule',rule);
      clip.append(path);defs.append(clip);return path;
    };
    const outline=mask(`${prefix}-outline`,'nonzero');
    outline.setAttribute('d',this.maskPath([config.ledge,...config.items]));
    this.surface.style.clipPath=`url(#${prefix}-outline)`;
    // Firefox can ignore an objectBoundingBox SVG clip path applied to HTML
    // children. This alpha mask has the same shelf-and-panels silhouette and
    // prevents the checkerboard embedded in the source photo from showing.
    const surfaceMask=svgMask(config,[config.ledge,...config.items]);
    this.surface.style.maskImage=surfaceMask;
    this.surface.style.webkitMaskImage=surfaceMask;
    this.surface.style.maskSize=this.surface.style.webkitMaskSize='100% 100%';
    this.surface.style.maskRepeat=this.surface.style.webkitMaskRepeat='no-repeat';
    this.frameMask=mask(`${prefix}-frame`);
    this.gapMask=mask(`${prefix}-gap`);
    this.frameMask.setAttribute('d',this.inverseMask(config.items));
    this.gapMask.setAttribute('d',this.inverseMask([]));
    const picture=()=>{
      const img=document.createElement('img');img.src=config.src;img.alt='';img.draggable=false;
      img.width=config.width;img.height=config.height;return img;
    };
    this.frame=picture();this.frame.style.clipPath=`url(#${prefix}-frame)`;
    this.full=picture();this.full.style.clipPath=`url(#${prefix}-gap)`;
    this.recess=picture();this.recess.style.transformOrigin='0 0';
    // Continue the real photographed top underneath the twelve occupied slots.
    const xs=config.frames.flatMap(frame=>frame.map(p=>p[0])),a=Math.min(...xs),b=Math.max(...xs);
    const patch=[[a,config.repair.sourceTop],[b,config.repair.sourceTop],[b,config.repair.sourceBottom],[a,config.repair.sourceBottom]];
    const place=[[a,config.repair.targetTop],[b,config.repair.targetTop],[b,config.repair.targetBottom],[a,config.repair.targetBottom]];
    this.recess.style.clipPath=polygon(patch.map(([x,y])=>[x/config.width,y/config.height]));
    this.recess.style.transform=`matrix3d(${projectiveTransform(patch,place).join(',')})`;
    this.surface.append(this.recess,this.frame,this.full);this.element.append(this.surface);
    this.selected=picture();this.selected.className='photographic-sample';
    this.selected.style.width=`${config.width}px`;this.selected.style.height=`${config.height}px`;
    this.selected.setAttribute('aria-hidden','true');
    world.append(definitions,this.element,this.selected);
    this.active=-1;this.cut=-1;
  }
  destroy(){
    this.definitions.remove();this.element.remove();this.selected.remove();
  }
  maskPath(shapes){
    const {width,height}=this.config;
    return shapes.map(points=>'M'+points.map(([x,y])=>`${x/width} ${y/height}`).join('L')+'Z').join(' ');
  }
  inverseMask(holes){return 'M0 0H1V1H0Z '+this.maskPath(holes);}
  scenePoints(index){
    return sampleAtRest(this.config,index);
  }
  render(progress,view,selection,portrait){
    const c=this.config,picked=selection.amount;
    const reveal=segment(progress,.75,.94),blend=segment(progress,.90,.95);
    this.element.style.left=`${view.x+c.x*view.scale}px`;
    this.element.style.top=`${view.y+c.y*view.scale}px`;
    this.element.style.transform=`scale(${c.scale*view.scale})`;
    this.element.style.opacity=reveal*(1-.2*picked);
    this.frame.style.opacity=1-blend;this.full.style.opacity=blend;
    const cut=picked>.0001?selection.active:-1;
    if(cut!==this.cut){
      this.gapMask.setAttribute('d',this.inverseMask(cut<0?[]:[c.items[cut]]));
      this.cut=cut;
    }
    const restBoxes=c.items.map((_,i)=>bounds(this.scenePoints(i).map(([x,y])=>[view.x+x*view.scale,view.y+y*view.scale])));
    let pickedBox;
    this.selected.style.opacity=cut<0?0:blend;
    if(cut>=0){
      const source=c.frames[cut];
      if(this.active!==cut){
        this.selected.style.clipPath=polygon(c.items[cut].map(([x,y])=>[x/c.width,y/c.height]));
        this.active=cut;
      }
      const target=sampleInHand(c,cut,picked,portrait).map(([x,y])=>[view.x+x*view.scale,view.y+y*view.scale]);
      this.selected.style.transform=`matrix3d(${projectiveTransform(source,target).join(',')})`;
      pickedBox=bounds(target);
    }
    return {blend,restBoxes,pickedBox};
  }
}
