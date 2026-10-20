/* Statischer S-Schwung und Frostglasfarben — keine Vergleichssteuerung. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const layer=document.createElement('div');layer.id='cvm-frost-landscape';layer.className='cvm-frost-scene';layer.setAttribute('aria-hidden','true');document.body.prepend(layer);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
 svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
 const defs=document.createElementNS(ns,'defs'),filter=document.createElementNS(ns,'filter');
 filter.id='cvm-sculpture-tone';filter.setAttribute('color-interpolation-filters','sRGB');
 const luminance=document.createElementNS(ns,'feColorMatrix');
 luminance.setAttribute('type','matrix');luminance.setAttribute('values','0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0');
 const transfer=document.createElementNS(ns,'feComponentTransfer');
 const channels=['R','G','B'].map(channel=>{const node=document.createElementNS(ns,'feFunc'+channel);node.setAttribute('type','table');transfer.append(node);return node;});
 const alpha=document.createElementNS(ns,'feFuncA');alpha.setAttribute('type','identity');transfer.append(alpha);
 filter.append(luminance,transfer);defs.append(filter);svg.append(defs);document.body.prepend(svg);

 function paletteMaterial(){
  let rgb=root.style.getPropertyValue('--cvm-glass-rgb').trim().split(/\s+/).map(Number);
  if(rgb.length!==3||!rgb.every(Number.isFinite))rgb=[37,78,58];
  rgb=rgb.map(v=>Math.max(0,Math.min(255,v)));
  const [r,g,b]=rgb.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;
  let h=0,s=0;
  if(delta){s=delta/(1-Math.abs(2*l-1));h=(max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4)/6;if(h<0)h++;}
  s=delta<.04?0:Math.min(.58,Math.max(.24,s));
  const bias=(l-.5)*.10+(root.dataset.glassNight==='true'?.04:0);
  function rgbAt(light){
   light=Math.min(1,Math.max(0,light+bias*(1-light)));
   const a=s*Math.min(light,1-light),f=n=>{const k=(n+h*12)%12;return light-a*Math.max(-1,Math.min(k-3,9-k,1));};
   return[f(0),f(8),f(4)];
  }
  return{rgbAt,hex:rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')};
 }

 function tone(paint){
  layer.dataset.color=paint.hex;
  // The same hue and saturation as the soft forms, with a continuous light/shadow ramp.
  const lightness=[.60,.64,.68,.72,.78,.84,.90,.96,1];
  const staticStyle=window.CVMRibbon?.styles[root.dataset.scenery]?.stationary;
  const material=staticStyle?window.CVMRibbon.staticPalette(root):null;
  const primary=window.CVMRibbon?.primaryColor(root);
  const samples=material?[0,.125,.25,.375,.5,.625,.75,.875,1].map(light=>{
   if(root.dataset.scenery!=='ribbon-early-s')return material.at(light);
   const level=Math.max(0,Math.min(1,(light-.36)/.64)),tint=material.at(level),weight=.18*(1-level);
   return tint.map((value,i)=>value*(1-weight)+(primary?.[i]??value)*weight);
  }):lightness.map(paint.rgbAt);
  channels.forEach((channel,i)=>channel.setAttribute('tableValues',samples.map(rgb=>rgb[i].toFixed(5)).join(' ')));
 }

 function colors(paint){
  const cssRgb=light=>paint.rgbAt(light).map(v=>(v*255).toFixed(3)).join(' ');
  root.style.setProperty('--cvm-frost-rgb',cssRgb(.68));
  root.style.setProperty('--cvm-frost-secondary',cssRgb(.78));
 }

 const scene=new window.CVMPageSweep.Scene(layer),paint=paletteMaterial();scene.color(paint);colors(paint);tone(paint);
 let queued=false;
 function refresh(){queued=false;scene.layout();}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(refresh);}
 window.addEventListener('resize',schedule,{passive:true});window.addEventListener('load',schedule,{once:true});
 if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(schedule);observer.observe(document.body);}
 document.fonts?.ready.then(schedule);schedule();
 window.cvmRibbonDiagnostics=()=>scene.report();
})();
