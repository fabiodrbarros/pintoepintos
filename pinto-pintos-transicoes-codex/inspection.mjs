import { clamp, mix, smooth } from './choreography.mjs';

// A new choice waits for the previous block to return to its own slot.
export class SampleSelection {
  constructor(){this.active=-1;this.wanted=-1;this.amount=0;this.motion=null;}
  choose(index,now,reduced=false){
    this.tick(now);
    this.wanted=index;
    if(this.active<0&&index>=0)this.active=index;
    const to=this.active===index&&index>=0?1:0;
    this.motion={from:this.amount,to,start:now,duration:reduced?0:to?820:620};
    this.tick(now);
  }
  tick(now){
    if(!this.motion)return;
    const {from,to,start,duration}=this.motion;
    const t=duration?clamp((now-start)/duration):1;
    this.amount=mix(from,to,smooth(t));
    if(t<1)return;
    this.amount=to;this.motion=null;
    if(to===0){
      this.active=this.wanted;
      if(this.active>=0){
        this.motion={from:0,to:1,start:now,duration:duration?820:0};
        if(!duration)this.tick(now);
      }
    }
  }
  get moving(){return this.motion!==null;}
}
