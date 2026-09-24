import { projectiveTransform } from './geometry.mjs';
import { catalogVisibility, catalogIsInteractive, catalogFaceAt, catalogCardSize } from './choreography.mjs';
import { catalogItems } from './catalog.mjs';

let catalogInstance=0;

// Original icons are alpha masks over the photographic wood, not replacement
// pictures. Their plane follows each moving panel throughout the transition.
export class EngravedCatalog {
  constructor(world,caption,invalidate=()=>{}){
    this.items=catalogItems;
    this.caption=caption;
    this.invalidate=invalidate;
    this.lift=Array(6).fill(0);this.lastTime=0;this.moving=false;
    this.originalCaption={text:caption.textContent,style:caption.getAttribute('style')};
    this.events=new AbortController();
    this.enabled=false;this.hovered=-1;this.focused=-1;
    const prefix=`wood-catalog-${++catalogInstance}`;
    this.element=document.createElement('div');
    this.element.className='engraved-catalog';
    this.element.setAttribute('role','group');
    this.element.setAttribute('aria-label','Categorias do catálogo');
    this.element.setAttribute('aria-hidden','true');
    this.element.inert=true;
    this.links=catalogItems.map((item,index)=>{
      const link=document.createElement('a');
      link.className=`catalog-panel${index>=4?' catalog-panel-dark':''}`;
      link.href=item.href;link.tabIndex=-1;
      link.setAttribute('aria-label',item.name);
      link.setAttribute('aria-describedby',`${prefix}-${index}`);
      const icon=document.createElement('img');icon.className='catalog-icon';
      icon.setAttribute('aria-hidden','true');
      icon.src=item.icon;icon.alt='';
      const label=document.createElement('span');label.className='catalog-name';
      label.setAttribute('aria-hidden','true');
      item.lines.forEach(line=>{
        const span=document.createElement('span');span.textContent=line;label.append(span);
      });
      const description=document.createElement('span');
      description.className='sr-only';description.id=`${prefix}-${index}`;
      description.textContent=item.description;
      link.append(icon,label,description);
      const on=(type,listener)=>link.addEventListener(type,listener,{signal:this.events.signal});
      on('click',event=>{if(!this.enabled)event.preventDefault();});
      on('pointerenter',()=>{this.hovered=index;this.updateCaption();});
      on('pointerleave',()=>{if(this.hovered===index)this.hovered=-1;this.updateCaption();});
      on('focus',()=>{this.focused=index;this.updateCaption();});
      on('blur',()=>{if(this.focused===index)this.focused=-1;this.updateCaption();});
      this.element.append(link);
      return link;
    });
    world.append(this.element);
  }
  updateCaption(){
    const index=this.enabled?(this.focused>=0?this.focused:this.hovered):-1;
    this.caption.textContent=index<0?'':this.items[index].description;
    this.caption.style.opacity=index<0?0:1;
    this.invalidate();
  }
  setLocale(copy){
    this.items=copy.services;
    this.element.setAttribute('aria-label',copy.categories);
    this.links.forEach((link,index)=>{
      const item=this.items[index];
      link.setAttribute('aria-label',item.name);
      link.querySelector('.sr-only').textContent=item.description;
      const label=link.querySelector('.catalog-name');
      label.replaceChildren(...item.lines.map(line=>{
        const span=document.createElement('span');span.textContent=line;return span;
      }));
    });
    this.updateCaption();
  }
  tick(now,reducedMotion=false){
    const elapsed=this.lastTime?Math.min(64,now-this.lastTime):16;
    const response=reducedMotion?1:1-Math.exp(-elapsed/110);
    const active=this.enabled?(this.focused>=0?this.focused:this.hovered):-1;
    this.moving=false;
    this.lift=this.lift.map((amount,index)=>{
      const target=index===active?1:0;
      const next=amount+(target-amount)*response;
      if(Math.abs(next-target)<.0005)return target;
      this.moving=true;return next;
    });
    this.lastTime=this.moving?now:0;
  }
  render(progress,view,portrait){
    const opacity=catalogVisibility(progress);
    const enabled=catalogIsInteractive(progress);
    if(enabled!==this.enabled){
      this.enabled=enabled;
      this.element.inert=!enabled;
      this.element.setAttribute('aria-hidden',String(!enabled));
      this.links.forEach(link=>{link.tabIndex=enabled?0:-1;link.style.pointerEvents=enabled?'auto':'none';});
      if(!enabled){this.hovered=-1;this.focused=-1;}
      this.updateCaption();
    }
    this.element.style.opacity=opacity;
    this.element.hidden=opacity<=0;
    if(opacity<=0)return;
    const {width,height}=catalogCardSize(portrait);
    const source=[[0,0],[width,0],[width,height],[0,height]];
    this.links.forEach((link,index)=>{
      const target=catalogFaceAt(index,progress,portrait,this.lift[index]).map(([x,y])=>[view.x+x*view.scale,view.y+y*view.scale]);
      link.style.width=`${width}px`;link.style.height=`${height}px`;
      link.style.zIndex=String(1000+Math.round(this.lift[index]*100));
      link.style.transform=`matrix3d(${projectiveTransform(source,target).join(',')})`;
    });
  }
  destroy(){
    this.events.abort();this.element.remove();
    this.caption.textContent=this.originalCaption.text;
    if(this.originalCaption.style===null)this.caption.removeAttribute('style');
    else this.caption.setAttribute('style',this.originalCaption.style);
  }
}
