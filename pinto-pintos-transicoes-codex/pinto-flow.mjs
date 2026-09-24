import { projectiveTransform, convexHull } from './geometry.mjs';
import { clamp, mix, segment, earlyProgress, shelfProgress, catalogVisibility, panelPose, materials, shelfPhotography as photo, logoPhoto, logoTextures, logoEdgeTextures, surfaces, project, viewport } from './choreography.mjs';
import { SampleSelection } from './inspection.mjs';
import { PhotographicShelf } from './photographic-shelf.mjs';
import { PhotographicPanels } from './photographic-panels.mjs';
import { EngravedCatalog } from './engraved-catalog.mjs';
import { catalogItems } from './catalog.mjs';
import { translateFlow } from './flow-translations.mjs';

const instances=new WeakMap();
let instanceCount=0;

/** Mount once on a connected .pinto-flow element. Safe to import during SSR.
 * Native window scroll drives one persistent scene. Call destroy() on unmount.
 */
export function mountPintoFlow(root,locale='pt'){
  if(!root?.matches?.('.pinto-flow')||!root.isConnected){
    throw new Error('mountPintoFlow requires a connected .pinto-flow element.');
  }
  if(instances.has(root))return instances.get(root);
  for(const selector of ['.wood-world','.cinema','.room','.pickup-shadow','.material-inspector','.sample-name','.sample-appearance','.sample-description','.sample-announcement','.return-sample','.copy-origin','.copy-form','.copy-catalog','.copy-material','.catalog-caption']){
    if(!root.querySelector(selector))throw new Error(`Missing Pinto Flow element: ${selector}`);
  }
  const events=new AbortController();
  let destroyed=false;
  let copy=translateFlow(locale,materials,catalogItems);
  const listen=(target,type,listener,options={})=>target.addEventListener(type,listener,{...options,signal:events.signal});

  const world=root.querySelector('.wood-world');
  const story=root;
  const cinema=root.querySelector('.cinema');
  const room=root.querySelector('.room');
  const pickupShadow=root.querySelector('.pickup-shadow');
  const inspector=root.querySelector('.material-inspector');
  const sampleName=root.querySelector('.sample-name');
  const sampleAppearance=root.querySelector('.sample-appearance');
  const sampleDescription=root.querySelector('.sample-description');
  const announcement=root.querySelector('.sample-announcement');
  const returnSample=root.querySelector('.return-sample');
  const copies=[...root.querySelectorAll('.copy')];
  const catalogCaption=root.querySelector('.catalog-caption');
  // Restore only the nodes/attributes this controller owns when unmounting.
  const initialAttributes=[room,pickupShadow,inspector,...copies].map(element=>[
    element,new Map(['style','aria-hidden','inert','id'].map(name=>[name,element.getAttribute(name)]))
  ]);
  const initialText=[sampleName,sampleAppearance,sampleDescription,announcement].map(element=>[element,element.textContent]);
  const wasReady=root.classList.contains('is-ready');
  const wasVisible=inspector.classList.contains('is-visible');
  inspector.id=`pinto-flow-${++instanceCount}-detail`;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const selection=new SampleSelection();
  const polygon=points=>`polygon(${points.map(([x,y])=>`${(x*100).toFixed(5)}% ${(y*100).toFixed(5)}%`).join(',')})`;

  function photoImage(src,width,height,source){
    const image=document.createElement('img');
    image.src=src;
    image.width=width;
    image.height=height;
    image.style.width=`${width}px`;
    image.style.height=`${height}px`;
    image.alt='';
    image.draggable=false;
    image.style.clipPath=polygon(source.map(([x,y])=>[x/width,y/height]));
    return image;
  }

  function createBody(material,index) {
    const element=document.createElement('button');
    element.type='button';
    element.className='wood-body';
    element.setAttribute('aria-label',`${copy.examine}: ${copy.materials[index].name}`);
    element.setAttribute('aria-controls',inspector.id);
    element.setAttribute('aria-expanded','false');
    element.tabIndex=-1;
    element.disabled=true;
    const hull=document.createElement('span');
    hull.className='wood-hull';
    hull.setAttribute('aria-hidden','true');
    element.append(hull);
    const faces=Object.fromEntries(['front','back','left','right','top','bottom'].map(kind=>{
      const source=kind==='top'?material.top:kind==='front'?material.front:material.grain;
      const logoSource=kind==='front'||kind==='back'?logoTextures[index]:logoEdgeTextures[index];
      const face=document.createElement('span');
      face.className=`wood-face wood-${kind}`;
      const logoImage=photoImage(logoPhoto.src,logoPhoto.width,logoPhoto.height,logoSource);
      const image=photoImage(photo.src,photo.width,photo.height,source);
      face.append(logoImage,image);
      hull.append(face);
      return [kind,{face,image,source,logoImage,logoSource}];
    }));
    listen(element,'click',()=>{
      if(shelfProgress(current)<.95)return;
      const wanted=selection.wanted===index?-1:index;
      selection.choose(wanted,performance.now(),reducedMotion.matches);
      const text=copy.materials[index];
      announcement.textContent=wanted<0?copy.returned:`${text.name}. ${text.description}`;
      schedule();
    });
    world.append(element);
    return {element,hull,faces};
  }

  const shadows=materials.map(()=>{
    const element=document.createElement('div');
    element.className='wood-shadow';
    world.append(element);
    return element;
  });
  const panels=materials.map(createBody);
  const photographicShelf=new PhotographicShelf(world,photo);
  const photographicPanels=new PhotographicPanels(world,{logo:logoPhoto,shelf:photo});
  const engravedCatalog=new EngravedCatalog(world,catalogCaption,schedule);
  let width=innerWidth,height=innerHeight,travel=1,stickyTop=0;
  let current=0,target=0,animation=0,lastTime=0,measureNeeded=true,displayedSample=-1;

  function area(points) {
    return Math.abs(points.reduce((sum,[x,y],index)=>{
      const next=points[(index+1)%points.length];
      return sum+x*next[1]-y*next[0];
    },0))/2;
  }

  function drawBody(body,pose,view,textureReveal=0,progress=0,index=0,paint=false) {
    const projected=surfaces(pose).map(face=>({...face,projected:face.points.map(point=>{
      const [x,y]=project(point);
      return [view.x+x*view.scale,view.y+y*view.scale];
    })}));
    const corners=projected.flatMap(face=>face.projected);
    const left=Math.min(...corners.map(p=>p[0])),top=Math.min(...corners.map(p=>p[1]));
    const w=Math.max(...corners.map(p=>p[0]))-left,h=Math.max(...corners.map(p=>p[1]))-top;
    const style=body.element.style;
    style.left=`${left}px`;style.top=`${top}px`;style.width=`${w}px`;style.height=`${h}px`;
    style.zIndex=String(Math.round(100000-pose.center[2]*100));
    body.hull.style.clipPath=polygon(convexHull(corners).map(([x,y])=>[(x-left)/w,(y-top)/h]));
    for(const surface of projected){
      const {face,image,source,logoImage,logoSource}=body.faces[surface.kind];
      const group=earlyProgress(progress)<.085?4:2;
      const internal=progress<.815&&((surface.kind==='left'&&index%group!==0)||(surface.kind==='right'&&index%group!==group-1));
      face.hidden=internal||!surface.visible||area(surface.projected)<.15;
      if(face.hidden)continue;
      const depth=catalogVisibility(progress);
      const brightness=surface.kind==='back'?.92:surface.kind==='left'||surface.kind==='right'?mix(.94,.80,depth):surface.kind==='bottom'?.86:surface.kind==='top'?mix(1,1.04,depth):1;
      face.style.filter=brightness===1?'none':`brightness(${brightness})`;
      if(paint){
        const shared={index,depth:pose.center[2],target:surface.projected,brightness};
        if(textureReveal<1)photographicPanels.add({...shared,source:logoSource,image:'logo',opacity:1,layer:0,mergeable:surface.kind==='front'&&textureReveal===0});
        if(textureReveal>0)photographicPanels.add({...shared,source,image:'shelf',opacity:textureReveal,layer:1,mergeable:false});
        continue;
      }
      const local=surface.projected.map(([x,y])=>[x-left,y-top]);
      face.style.clipPath=polygon(local.map(([x,y])=>[x/w,y/h]));
      logoImage.hidden=textureReveal===1;
      image.hidden=textureReveal===0;
      if(!logoImage.hidden)logoImage.style.transform=`matrix3d(${projectiveTransform(logoSource,local).join(',')})`;
      if(!image.hidden)image.style.transform=`matrix3d(${projectiveTransform(source,local).join(',')})`;
      image.style.opacity=textureReveal;
    }
    return {left,top,width:w,height:h};
  }

  function showCopy(element,opacity,offset){
    element.style.opacity=opacity;
    element.style.transform=`translateY(${offset}px)`;
    element.setAttribute('aria-hidden',String(opacity<.2));
  }

  function render(progress){
    const view=viewport(width,height,progress);
    const portrait=width<760&&height>width;
    const early=earlyProgress(progress),late=shelfProgress(progress);
    const settle=segment(late,.65,.94);
    const textures=segment(late,.70,.89),picked=selection.amount;
    const interactive=late>=.95;
    const shelf=photographicShelf.render(late,view,selection,portrait);
    const paint=photographicPanels.begin(width,height,1-shelf.blend,devicePixelRatio);
    const shadow=catalogVisibility(progress);
    photographicPanels.canvas.style.filter=shadow>.001?`drop-shadow(${10*view.scale}px ${20*view.scale}px ${12*view.scale}px rgba(59,37,19,${.18*shadow}))`:'none';
    const pickedBox=shelf.pickedBox;
    panels.forEach((body,index)=>{
      const selected=selection.active===index;
      let box;
      if(shelf.blend<1){
        box=drawBody(body,panelPose(index,progress,portrait,engravedCatalog.lift[Math.floor(index/2)]),view,textures,progress,index,paint);
      }else{
        box=selected&&pickedBox?pickedBox:shelf.restBoxes[index];
        const style=body.element.style;
        style.left=`${box.left}px`;style.top=`${box.top}px`;
        style.width=`${box.width}px`;style.height=`${box.height}px`;
        style.zIndex=selected&&picked>.001?'104200':'102300';
      }
      body.hull.style.opacity=paint?0:1-shelf.blend;
      body.element.disabled=!interactive;
      body.element.tabIndex=interactive?0:-1;
      body.element.classList.toggle('is-interactive',interactive);
      body.element.classList.toggle('is-held',selected&&picked>.1);
      body.element.setAttribute('aria-expanded',String(selected&&picked>.05));
      const shade=shadows[index].style;
      shade.left=`${box.left+box.width*.08}px`;
      shade.top=`${view.y+mix(850,779,settle)*view.scale}px`;
      shade.width=`${box.width*.84}px`;
      shade.height=`${mix(21,11,settle)*view.scale}px`;
      shade.opacity=mix(.11,.025,settle)*(1-picked)*(1-shelf.blend);
    });
    if(paint)photographicPanels.finish();
    engravedCatalog.render(progress,view,portrait);
    pickupShadow.style.opacity=pickedBox?picked*.12:0;
    if(pickedBox){
      pickupShadow.style.left=`${pickedBox.left+18*view.scale}px`;
      pickupShadow.style.top=`${pickedBox.top+30*view.scale}px`;
      pickupShadow.style.width=`${pickedBox.width*.92}px`;
      pickupShadow.style.height=`${pickedBox.height*.94}px`;
    }

    const originOut=segment(early,.045,.16);
    const formIn=segment(early,.11,.28),formOut=segment(early,.575,.69);
    const materialIn=segment(late,.755,.89);
    showCopy(copies[0],1-originOut,-42*originOut);
    showCopy(copies[1],formIn*(1-formOut),90*(1-formIn)-30*formOut);
    showCopy(copies[2],catalogVisibility(progress),22*(1-segment(progress,.535,.605)));
    showCopy(copies[3],materialIn*(1-segment(picked,.1,.45)),22*(1-materialIn));
    const detail=segment(picked,.4,.85);
    if(selection.active>=0&&displayedSample!==selection.active){
      const material=copy.materials[selection.active];
      sampleName.textContent=material.name;
      sampleAppearance.textContent=material.appearance;
      sampleDescription.textContent=material.description;
      displayedSample=selection.active;
    }
    inspector.style.opacity=detail;
    inspector.style.transform=`translateY(${14*(1-detail)}px)`;
    inspector.classList.toggle('is-visible',detail>.3);
    inspector.inert=detail<.3;
    inspector.setAttribute('aria-hidden',String(detail<.3));

    room.style.transform=reducedMotion.matches?'none':`translate(${-1.2*progress}%,${-.8*progress}%) scale(${1+.045*Math.sin(Math.PI*progress)})`;
  }

  function measure(){
    width=cinema.clientWidth;
    height=cinema.clientHeight;
    travel=Math.max(1,story.offsetHeight-height);
    stickyTop=parseFloat(getComputedStyle(cinema).top)||0;
    measureNeeded=false;
  }

  function frame(now){
    animation=0;
    if(destroyed)return;
    if(measureNeeded)measure();
    target=clamp((stickyTop-story.getBoundingClientRect().top)/travel);
    const elapsed=lastTime?Math.min(64,now-lastTime):16;
    lastTime=now;
    const response=reducedMotion.matches?1:1-Math.exp(-elapsed/85);
    current+=(target-current)*response;
    if(Math.abs(target-current)<.00004)current=target;
    if(shelfProgress(target)<.925&&selection.wanted>=0)selection.choose(-1,now,reducedMotion.matches);
    selection.tick(now);
    engravedCatalog.tick(now,reducedMotion.matches);
    render(current);
    if(current!==target||selection.moving||engravedCatalog.moving)schedule();
    else lastTime=0;
  }

  function schedule(){if(!destroyed&&!animation)animation=requestAnimationFrame(frame);}
  function closeSample(restoreFocus=true){
    const active=selection.active;
    if(active<0)return;
    selection.choose(-1,performance.now(),reducedMotion.matches);
    announcement.textContent=copy.returned;
    if(restoreFocus&&shelfProgress(current)>=.95)panels[active].element.focus({preventScroll:true});
    schedule();
  }
  listen(returnSample,'click',()=>closeSample());
  listen(window,'keydown',event=>{if(event.key==='Escape')closeSample();});
  listen(cinema,'click',event=>{
    if(!event.target.closest('button,a,.material-inspector'))closeSample();
  });
  listen(window,'scroll',schedule,{passive:true});
  listen(window,'resize',()=>{measureNeeded=true;schedule();},{passive:true});
  listen(window,'pageshow',()=>{measureNeeded=true;schedule();});
  listen(reducedMotion,'change',()=>{
    selection.choose(selection.wanted,performance.now(),reducedMotion.matches);
    schedule();
  });

  // Observe the component itself, including host layout changes.
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{
    measureNeeded=true;schedule();
  });
  observer?.observe(story);observer?.observe(cinema);
  document.fonts?.ready.then(()=>{if(!destroyed){measureNeeded=true;schedule();}});

  measure();
  current=target=clamp((stickyTop-story.getBoundingClientRect().top)/travel);
  render(current);
  engravedCatalog.setLocale(copy);
  const photos=[photo.src,logoPhoto.src,...catalogItems.map(item=>item.icon)].map(src=>{
    const image=new Image();image.src=src;
    return image.decode().catch(()=>{});
  });
  const ready=Promise.all([...photos,photographicPanels.loaded]).then(()=>{
    if(destroyed)return;
    root.classList.add('is-ready');
    schedule();
  });

  const controller={
    ready,
    setLocale(locale){
      if(destroyed)return;
      copy=translateFlow(locale,materials,catalogItems);
      panels.forEach((panel,index)=>panel.element.setAttribute('aria-label',`${copy.examine}: ${copy.materials[index].name}`));
      engravedCatalog.setLocale(copy);
      displayedSample=-1;
      const selected=copy.materials[selection.active];
      announcement.textContent=selected?`${selected.name}. ${selected.description}`:'';
      schedule();
    },
    refresh(){if(!destroyed){measureNeeded=true;schedule();}},
    destroy(){
      if(destroyed)return;
      destroyed=true;
      events.abort();observer?.disconnect();
      cancelAnimationFrame(animation);
      engravedCatalog.destroy();photographicPanels.destroy();photographicShelf.destroy();
      for(const body of panels)body.element.remove();
      for(const shadow of shadows)shadow.remove();
      for(const [element,attributes] of initialAttributes){
        for(const [name,value] of attributes){
          if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);
        }
      }
      for(const [element,value] of initialText)element.textContent=value;
      root.classList.toggle('is-ready',wasReady);
      inspector.classList.toggle('is-visible',wasVisible);
      instances.delete(root);
    },
  };
  instances.set(root,controller);
  return controller;
}
