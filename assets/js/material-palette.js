/* Feste Materialfarben, ohne Vergleichsoberfläche. */
(()=>{
 function primaryColor(root){
  const values=root.style.getPropertyValue('--cvm-glass-rgb').trim().split(/\s+/).map(Number);
  return (values.length===3&&values.every(Number.isFinite)?values:[37,78,58]).map(v=>Math.max(0,Math.min(255,v))/255);
 }
 function lightTone(primary,light=0){return primary.map(v=>1-(1-v)*.38*(1-Math.pow(Math.max(0,Math.min(1,light)),.85)));}
 function readRoleColor(style,name){
  const value=style?.getPropertyValue(name)?.trim()||'';
  if(/^#[0-9a-f]{6}$/i.test(value))return[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255);
  const rgb=value.match(/[\d.]+/g)?.map(Number);
  return rgb?.length===3&&rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=255)?rgb.map(v=>v/255):null;
 }
 function derivedTints(primary){
  const [r,g,b]=primary,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;
  let h=0,s=0;
  if(delta){s=delta/(1-Math.abs(2*l-1));h=(max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4)/6;if(h<0)h++;}
  s=delta<.04?0:Math.max(.16,Math.min(.58,s));
  return[.76,.80,.84,.94].map(light=>{
   const a=s*Math.min(light,1-light),f=n=>{const k=(n+h*12)%12;return light-a*Math.max(-1,Math.min(k-3,9-k,1));};
   return[f(0),f(8),f(4)];
  });
 }
 function staticPalette(root){
  const primary=primaryColor(root);
  if(root.dataset.colorRoles!=='after')return{graduated:false,source:'primary-tint',stops:[],at:light=>lightTone(primary,light)};
  const css=window.getComputedStyle?.(root),names=['--cvm-role-tint1','--cvm-role-tint3','--cvm-role-tint2','--cvm-role-solid'];
  const provided=names.map(name=>readRoleColor(css,name)),valid=provided.every(Boolean),colors=valid?provided:derivedTints(primary);
  const levels=[0,.22,.48,.76,1],stops=[...colors,colors[3].map(v=>v*.24+.76)];
  return{graduated:true,source:valid?'color-roles':'derived-color-roles',stops:stops.map(rgb=>[...rgb]),at(light){
   light=Math.max(0,Math.min(1,light));let i=0;while(i<levels.length-2&&light>levels[i+1])i++;
   const t=(light-levels[i])/(levels[i+1]-levels[i]);return stops[i].map((v,c)=>v+(stops[i+1][c]-v)*t);
  }};
 }

 window.CVMRibbon={primaryColor,staticPalette,styles:{'ribbon-early-s':{stationary:true}},variants:['ribbon-early-s']};
})();
