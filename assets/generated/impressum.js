/* Quelle: assets/innovations/19-kontaktkarte.js */
(()=>{const h=document.querySelector('h1');if(!h)return;const card=document.createElement('section');card.className='legal-contact-card';card.setAttribute('aria-label','CVM TAX Kontaktdaten');card.innerHTML='<div><strong>CVM TAX</strong><p>Schillinger Weg 35<br>54421 Reinsfeld</p></div><div class="legal-contact-actions"><a href="tel:+491721734962">0172 1734962</a><a href="mailto:info@cvm-tax.de">info@cvm-tax.de</a><button type="button">Kanzleikontakt speichern</button></div>';h.after(card);card.querySelector('button').onclick=()=>{const text=['BEGIN:VCARD','VERSION:3.0','FN:CVM TAX','ORG:CVM TAX GbR','TEL;TYPE=WORK,VOICE:+491721734962','EMAIL;TYPE=WORK:info@cvm-tax.de','ADR;TYPE=WORK:;;Schillinger Weg 35;Reinsfeld;;54421;Deutschland','URL:https://www.cvm-tax.de/','END:VCARD'].join('\r\n')+'\r\n';const url=URL.createObjectURL(new Blob([text],{type:'text/vcard;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='CVM-TAX-Kontakt.vcf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};})();
;
/* Quelle: assets/quality/01-anker.js */
(()=>{
let pending=null;
const align=()=>{
  if(!pending||Date.now()>pending.until)return;
  const target=document.getElementById(pending.id);if(!target)return;
  const nav=document.querySelector('.nav');
  const gap=(nav?.getBoundingClientRect().bottom||0)+20;
  const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-gap);
  try{window.scrollTo({top,behavior:'instant'})}catch{
    try{window.scrollTo(0,top)}catch{/* Native fragment navigation remains available. */}
  }
};
const request=(id,moveFocus=false)=>{
  const target=document.getElementById(id);if(!target||target.tagName==='DIALOG')return;
  pending={id,until:Date.now()+1200};
  if(moveFocus){
    const focusTarget=target.getAttribute('aria-hidden')==='true'?target.closest('section'):target;
    if(focusTarget){
      if(!focusTarget.hasAttribute('tabindex')){focusTarget.setAttribute('tabindex','-1');focusTarget.addEventListener('blur',()=>focusTarget.removeAttribute('tabindex'),{once:true})}
      try{focusTarget.focus({preventScroll:true})}catch{focusTarget.focus()}
    }
  }
  align();requestAnimationFrame(align);
};
document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash||link.hasAttribute('data-modal')||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  let id;try{id=decodeURIComponent(url.hash.slice(1))}catch{return}
  const target=document.getElementById(id);if(!target||target.tagName==='DIALOG')return;
  // Keep the real link's default action. JavaScript only adjusts the header gap afterwards.
  requestAnimationFrame(()=>{if(location.hash===url.hash)request(id,true)});
});
['wheel','touchstart','keydown'].forEach(type=>addEventListener(type,()=>pending=null,{passive:true}));
const initial=()=>{if(location.hash){try{request(decodeURIComponent(location.hash.slice(1)))}catch{}}};
addEventListener('hashchange',initial);addEventListener('popstate',initial);addEventListener('load',initial);document.fonts?.ready.then(initial);window.ScrollTrigger?.addEventListener('refresh',align);document.addEventListener('cvm-motion-ready',()=>{window.ScrollTrigger?.addEventListener('refresh',align);initial()});
})();

;
/* Quelle: assets/quality/02-position.js */
(()=>{const sync=()=>{const article=document.body.classList.contains('reading-page');document.querySelectorAll('#site-tree a,.navlinks a').forEach(a=>{const u=new URL(a.href,location.href);const active=article?u.hash==='#ratgeber':!!location.hash&&u.hash===location.hash;if(active)a.setAttribute('aria-current',article?'page':'location');else a.removeAttribute('aria-current')})};sync();addEventListener('hashchange',sync);addEventListener('popstate',sync);document.addEventListener('click',()=>requestAnimationFrame(sync));})();
