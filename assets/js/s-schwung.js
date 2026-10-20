/* One content-aware, document-bound ribbon. Material comes from the approved image. */
(()=>{
 'use strict';
 const source=new URL('../background/s-schwung.png',document.currentScript.src).href;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const smooth=v=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
 // Keep the wider material visible over a passage, with smooth entry and exit.
 const swellEnvelope=t=>smooth(t/.32)*smooth((1-t)/.32);
 // Hero-scaled curves span the whole document. All knots use the
 // same base width from the approved material, with a few soft local swells.
 const sections=[
  ['so-gehts',.84],['preis',.72],['leistungen',.70],
  ['kanzlei',.78],['ratgeber',.72],['kontakt',.75]
 ];
 function finishPlan(nodes){
  const secants=nodes.slice(1).map((n,i)=>(n.x-nodes[i].x)/(n.y-nodes[i].y));
  nodes.forEach((node,i)=>{
   const before=secants[i-1],after=secants[i];
   node.slope=i===0?after:i===nodes.length-1?before:before*after<=0?0:2*before*after/(before+after);
  });
 }
 // Natural cubic interpolation keeps both tangent and curvature continuous.
 function finishRoundPlan(nodes){
  const count=nodes.length,h=nodes.slice(1).map((n,i)=>n.y-nodes[i].y);
  const diagonal=Array(count).fill(0),upper=Array(count).fill(0),rhs=Array(count).fill(0),second=Array(count).fill(0);
  diagonal[0]=diagonal[count-1]=1;
  for(let i=1;i<count-1;i++){
   diagonal[i]=2*(h[i-1]+h[i]);upper[i]=h[i];
   rhs[i]=6*((nodes[i+1].x-nodes[i].x)/h[i]-(nodes[i].x-nodes[i-1].x)/h[i-1]);
   const ratio=h[i-1]/diagonal[i-1];diagonal[i]-=ratio*upper[i-1];rhs[i]-=ratio*rhs[i-1];
  }
  for(let i=count-2;i>=0;i--)second[i]=(rhs[i]-upper[i]*second[i+1])/diagonal[i];
  nodes.forEach((node,i)=>{
   node.round=true;node.bendBias=0;
   node.slope=i<count-1?(nodes[i+1].x-node.x)/h[i]-h[i]*(2*second[i]+second[i+1])/6:
    (node.x-nodes[i-1].x)/h[i-1]+h[i-1]*(second[i-1]+2*second[i])/6;
  });
 }
 const smoothRound=v=>{const t=clamp(v,0,1);return t*t*t*(10+t*(-15+6*t));};
 const roundSwellEnvelope=t=>smoothRound(t/.4)*smoothRound((1-t)/.4);
 function desktopPlan(width,height,materialWidth,body,heroEnd){
  const box=document.querySelector('#so-gehts > .wrap')?.getBoundingClientRect();
  const contentWidth=box?.width>0?Math.min(box.width,width-40):Math.min(1180,width-72);
  const left=box?.width>0?box.left:(width-contentWidth)/2,right=left+contentWidth;
  const bandWidth=clamp(contentWidth*materialWidth*.58,72,172);
  const nodes=[
   {y:-heroEnd*.18,x:right+contentWidth*.06,width:bandWidth,section:'hero'},
   {y:heroEnd*.28,x:right-contentWidth*.11,width:bandWidth,section:'hero'},
   {y:heroEnd*.80,x:right+contentWidth*.025,width:bandWidth,section:'hero'}
  ];
  const landmarks=sections.flatMap(([id,fraction])=>{
   const rect=document.getElementById(id)?.getBoundingClientRect();
   return rect&&rect.height>0?[{id,y:rect.top-body.top+rect.height*fraction,top:rect.top-body.top,bottom:rect.bottom-body.top}]:[];
  });
  // Long, unequal passages around the content perimeter, not viewport-wide zigzags.
  const span=Math.max(heroEnd*.98,contentWidth*.88);
  const gestures=[ [.08,1.02,.025],[.94,1.18,-.035],[.16,1.04,.02],[.86,1.26,-.025],[.06,1.10,.03],[.93,1.17,-.02] ];
  for(let turn=0;nodes.at(-1).y<height+80;turn++){
   const gesture=gestures[turn]||[turn%2===0?.10+.04*Math.sin(turn):.91+.03*Math.cos(turn),1.10+.10*Math.sin(turn*.83),.025*Math.sin(turn)];
   const previous=nodes.at(-1),target=previous.y+span*gesture[1];
   const nearby=landmarks.filter(n=>Math.abs(n.y-target)<span*.10&&n.y-previous.y>=span*.92)
    .sort((a,b)=>Math.abs(a.y-target)-Math.abs(b.y-target));
   const y=nearby[0]?.y??target;
   previous.bendBias=gesture[2];previous.swell=[.12,.24,.18,0,.26,0][turn]||0;
   nodes.push({y,x:left+contentWidth*gesture[0],width:bandWidth,section:landmarks.find(n=>y>=n.top&&y<=n.bottom)?.id??'transition'});
  }
  finishRoundPlan(nodes);
  const maxBandWidth=bandWidth*(1+Math.max(...nodes.map(n=>n.swell||0)));
  return{layout:'desktop',heroEnd,heroCurveEnd:nodes[3].y,bandWidth,maxBandWidth,hero:{x:left,y:0,w:contentWidth,h:heroEnd},nodes,width,height,contentWidth,curveSpanRange:[span*.92,span*1.36]};
 }
 function plan(width,height,materialWidth=.23){
  const mobile=width<=760,body=document.body.getBoundingClientRect(),hero=document.querySelector('#top > .hero')?.getBoundingClientRect();
  const heroEnd=clamp(hero?hero.bottom-body.top:width*(mobile?1.88:.8),1,height);
  if(!mobile)return desktopPlan(width,height,materialWidth,body,heroEnd);
  const heroWidth=(mobile?width:Math.min(width*.80,1280))*1.18,heroX=width-heroWidth;
  const bandWidth=heroWidth*materialWidth;
  const nodes=[
   {y:-heroEnd*.12,x:width*.90,width:bandWidth,section:'hero'},
   {y:heroEnd*.16,x:width*.68,width:bandWidth,section:'hero'},
   {y:heroEnd*.54,x:width*.99,width:bandWidth,section:'hero'},
   {y:heroEnd*1.25,x:width*.18,width:bandWidth,section:'hero-return'}
  ];
  // Keep later bends at the same scale as the approved hero curve. Content
  // landmarks may shift a turn slightly, but cannot stretch it over a section.
  const landmarks=sections.flatMap(([id,fraction])=>{
   const box=document.getElementById(id)?.getBoundingClientRect();
   return box&&box.height>0?[{id,top:box.top-body.top,bottom:box.bottom-body.top,y:box.top-body.top+box.height*fraction}]:[];
  });
  // Deliberately composed gestures: broad edge turns alternate with shallower,
  // inward turns. Each has its own length and asymmetric transition.
  const gestures=[
   [.96,.74,.16],[.37,.55,-.16],[.77,.61,.08],[.14,.77,-.12],
   [.94,.68,.19],[.40,.54,-.08],[.87,.79,-.17],[.19,.60,.17],
   [.97,.73,.10],[.30,.57,-.19],[.79,.67,.15],[.16,.75,-.11]
  ];
  const swells=[0,.12,0,.28,0,.20,.12,0,.28,0,0,.20];
  const minSpan=heroEnd*.52,maxSpan=heroEnd*.80;
  for(let turn=0;nodes.at(-1).y<height+80;turn++){
   const gesture=gestures[turn]||[
    turn%2===0?.86+.10*Math.sin(turn*1.37):.27+.12*Math.cos(turn*1.19),
    .66+.12*Math.sin(turn*1.79+.7),.18*Math.sin(turn*1.43+.85)
   ];
   const previous=nodes.at(-1),target=previous.y+heroEnd*gesture[1];
   const nearby=landmarks.filter(n=>n.y>=previous.y+minSpan&&n.y<=previous.y+maxSpan&&Math.abs(n.y-target)<=heroEnd*.04)
    .sort((a,b)=>Math.abs(a.y-target)-Math.abs(b.y-target));
   const y=nearby[0]?.y??target;
   const section=landmarks.find(n=>y>=n.top&&y<=n.bottom)?.id??'transition';
   const x=gesture[0];
   previous.bendBias=gesture[2];
   previous.swell=swells[turn]??(Math.sin(turn*1.91)>.7?.20:0);
   nodes.push({y,x:width*x,width:bandWidth,section});
  }
  finishRoundPlan(nodes);
  const maxBandWidth=bandWidth*(1+Math.max(...nodes.map(n=>n.swell||0)));
  return{layout:'mobile',maxBandWidth,heroEnd,heroCurveEnd:heroEnd*1.25,bandWidth,hero:{x:heroX,y:0,w:heroWidth,h:heroEnd},nodes,width,height};
 }
 function sample(nodes,y){
  const first=nodes[0];
  if(y<first.y)return{x:first.x+(y-first.y)*first.slope,width:first.width,dx:first.slope,section:first.section};
  let i=0;while(i<nodes.length-2&&y>nodes[i+1].y)i++;
  const a=nodes[i],b=nodes[i+1],h=Math.max(1,b.y-a.y),raw=clamp((y-a.y)/h,0,1);
  // A smooth, monotone time warp makes the lower turns asymmetric while
  // preserving both position and tangent at their joins. Hero segments use 0.
  const bias=a.bendBias||0,t=raw+16*bias*raw*raw*(1-raw)*(1-raw);
  const rate=1+32*bias*raw*(1-raw)*(1-2*raw),t2=t*t,t3=t2*t;
  return{x:(2*t3-3*t2+1)*a.x+(t3-2*t2+t)*a.slope*h+(-2*t3+3*t2)*b.x+(t3-t2)*b.slope*h,
   width:(a.width+(b.width-a.width)*(3*t2-2*t3))*(1+(a.swell||0)*(a.round?roundSwellEnvelope(raw):swellEnvelope(raw))),
   dx:((6*t2-6*t)*a.x/h+(3*t2-4*t+1)*a.slope+(-6*t2+6*t)*b.x/h+(3*t2-2*t)*b.slope)*rate,section:a.section};
 }
 function makeMaterial(image){
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
  ctx.drawImage(image,0,0);const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
  const atlas=document.createElement('canvas');atlas.width=256;atlas.height=64;const out=atlas.getContext('2d');if(!out)return null;
  let measuredWidth=0,measuredRows=0;
  for(let row=0;row<64;row++){
   const y=Math.floor(canvas.height*(.105+.075*row/63));let left=canvas.width,right=-1;
   for(let x=0;x<canvas.width;x++){if(data[(y*canvas.width+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);}}
   if(right>left){measuredWidth+=right-left+1;measuredRows++;left=Math.max(0,left-2);right=Math.min(canvas.width-1,right+2);out.drawImage(image,left,y,right-left+1,1,0,row,256,1);}
  }
  atlas.bandFraction=measuredRows?measuredWidth/measuredRows/canvas.width:.23;
  canvas.width=canvas.height=0;return atlas;
 }
 class Scene{
  constructor(host){
   this.host=host;this.root=document.documentElement;this.disposed=false;this.loaded=false;this.canvases=[];
   this.element=document.createElement('div');this.element.className='cvm-page-sweep';this.element.setAttribute('aria-hidden','true');host.append(this.element);
   this.image=new Image();this.image.className='cvm-page-sweep__hero';this.image.alt='';this.image.decoding='async';this.image.style.display='none';this.element.append(this.image);
   this.image.onload=()=>{if(this.disposed)return;this.loaded=true;try{this.atlas=makeMaterial(this.image);}catch(e){this.error=e.message;}this.key='';this.layout();};
   this.image.onerror=()=>{this.error='Bandgrafik konnte nicht geladen werden';};this.image.src=source;
   host.dataset.renderer='section-ribbon-image-material';this.layout();
  }
  color(){this.material=window.CVMRibbon.staticPalette(this.root);}
  layout(){
   if(this.disposed)return;
   this.width=this.root.clientWidth||window.innerWidth;
   const body=document.body.getBoundingClientRect(),footer=document.querySelector('body > footer')?.getBoundingClientRect();
   this.height=Math.max(document.body.offsetHeight,footer?footer.bottom-body.top:0,1);
   // Preserve the existing curve plan; paint only up to the footer divider.
   this.paintHeight=footer?Math.max(0,footer.top-body.top):this.height;
   this.plan=plan(this.width,this.height,this.atlas?.bandFraction);
   this.element.dataset.layout=this.plan.layout;
   Object.assign(this.element.style,{width:this.width+'px',height:this.paintHeight+'px'});
   const hero=this.plan.hero;Object.assign(this.image.style,{left:hero.x+'px',top:'0px',width:hero.w+'px',height:hero.h+'px'});
   if(!this.loaded||!this.atlas)return;
   const key=JSON.stringify([this.width,this.height,this.paintHeight,this.plan.hero,this.plan.nodes]);if(key===this.key)return;this.key=key;
   for(const c of this.canvases){c.width=c.height=0;c.remove();}this.canvases=[];
   const start=0;
   for(let top=start;top<this.paintHeight;top+=960){
    const canvas=document.createElement('canvas');canvas.className='cvm-page-sweep__tile';canvas.width=Math.ceil(this.width);canvas.height=Math.ceil(Math.min(960,this.paintHeight-top));
    canvas.style.top=top+'px';canvas.style.width=this.width+'px';canvas.style.height=canvas.height+'px';this.element.append(canvas);this.canvases.push(canvas);
    const ctx=canvas.getContext('2d');if(!ctx){this.error='Canvas nicht verfügbar';continue;}
    // Paint each row once. Tangent projection preserves material thickness
    // without colliding rotated strips, including on narrow mobile curves.
    for(let y=top;y<top+canvas.height;y++){
     const point=sample(this.plan.nodes,y),crossWidth=point.width*Math.hypot(1,point.dx);
     const row=Math.floor((Math.sin(y*.0027)+1)*31.5);
     ctx.drawImage(this.atlas,0,row,256,1,point.x-crossWidth/2,y-top,crossWidth,1);
    }
   }
  }
  report(){return{renderer:'section-ribbon-image-material',variant:'ribbon-early-s',documentBound:true,stationary:true,scrollListener:false,running:false,loaded:this.loaded,error:this.error||null,width:this.width,height:this.height,paintHeight:this.paintHeight,endsAtFooter:true,layout:this.plan.layout,roundCurves:true,paintMethod:'non-overlapping-scanlines',heroEnd:this.plan.heroEnd,heroCurveEnd:this.plan.heroCurveEnd,bandWidth:this.plan.bandWidth,uniformWidth:false,maxBandWidth:this.plan.maxBandWidth,variation:'composed-bends-with-restrained-width-levels',curveSpanRange:this.plan.curveSpanRange||[this.plan.heroEnd*.52,this.plan.heroEnd*.80],palette:this.root.dataset.palette,graduated:!!this.material?.graduated,modules:1,tiles:this.canvases.length,anchors:this.plan.nodes.map(n=>({section:n.section,y:+n.y.toFixed(1),x:+n.x.toFixed(1),width:+n.width.toFixed(1),swell:n.swell||0})),source};}
  destroy(){this.disposed=true;this.image.onload=this.image.onerror=null;for(const c of this.canvases)c.width=c.height=0;if(this.atlas)this.atlas.width=this.atlas.height=0;this.element.remove();}
 }
 window.CVMPageSweep={Scene,plan,sample};
})();
