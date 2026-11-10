/* Quelle: assets/innovations/11-datenschutz.js */
(()=>{const main=document.querySelector('main');if(!main)return;const headings=[...main.querySelectorAll('h2[data-privacy-section]')];if(headings.length!==10)return;headings.forEach((h,i)=>h.id='datenschutz-'+(i+1));const header=document.createElement('header');header.className='legal-document-header';while(main.firstChild&&main.firstChild!==headings[0])header.append(main.firstChild);const body=document.createElement('div');body.className='legal-document-body';while(main.firstChild)body.append(main.firstChild);const map=document.createElement('aside');map.className='legal-document-map';map.innerHTML='<h2>Was möchtest du nachlesen?</h2><div class="privacy-intents"><a href="#datenschutz-2">Websitebesuch</a><a href="#datenschutz-3">Anfrage & Kontakt</a><a href="#datenschutz-6">Mandantenbereich</a></div><details><summary>Alle Abschnitte</summary><nav aria-label="Datenschutzabschnitte"></nav></details>';for(const h of headings){const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;map.querySelector('nav').append(a);}main.classList.add('legal-document');main.append(header,map,body);})();
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
