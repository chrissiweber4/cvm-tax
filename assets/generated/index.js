/* Quelle: assets/innovations/01-ergebnis.js */
(()=>{const form=document.querySelector('#priceCheck');if(!form)return;const update=()=>{document.querySelector('[data-result-year]').textContent=form.querySelector('[name="year"]:checked')?.value||'';};form.addEventListener('change',update);update();})();
;
/* Quelle: assets/innovations/04-ratgeber-hub.js */
(()=>{const section=document.querySelector('#ratgeber'),grid=section?.querySelector('.article-grid');if(!grid)return;const categories=[['Alle Themen','all'],['Vorbereiten','unterlagen'],['Arbeit & Alltag','homeoffice'],['Luxemburg','luxemburg'],['Rente','rente']];const nav=document.createElement('div');nav.className='guide-filters';nav.setAttribute('role','group');nav.setAttribute('aria-label','Ratgeber nach Anliegen');const status=document.createElement('p');status.className='guide-filter-status';status.setAttribute('role','status');grid.before(nav,status);for(const [label,key] of categories){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.filter=key;button.setAttribute('aria-pressed',String(key==='all'));button.onclick=()=>{nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;grid.querySelectorAll('.article').forEach(a=>{a.hidden=key!=='all'&&!a.getAttribute('href').includes(key);if(!a.hidden)count++;});grid.dataset.filtered=String(key!=='all');status.textContent=count+' Ratgeber für deine Auswahl';};nav.append(button);}status.textContent='Vier Einstiege für deine nächste Frage.';})();
;
/* Quelle: assets/innovations/07-pruefblatt.js */
(()=>{const form=document.querySelector('#priceCheck');if(!form)return;let last='';const sync=()=>{const step=form.querySelector('.question.active')?.dataset.step;if(step==='review'&&last!=='review')form.querySelector('#requestDetails').open=true;last=step;};new MutationObserver(sync).observe(form.querySelector('#questions'),{subtree:true,attributes:true,attributeFilter:['class','hidden']});sync();})();
;
/* Quelle: assets/innovations/20-abschluss.js */
(()=>{const footer=document.querySelector('footer');if(!footer)return;const legal=[...footer.querySelectorAll('a')].filter(a=>['impressum.html','datenschutz.html'].includes(a.getAttribute('href')));const home=document.querySelector('#priceCheck')?'':'./';const inner=document.createElement('div');inner.className='shared-footer-inner';inner.innerHTML='<div class="shared-footer-main"><div><a class="shared-footer-brand" href="'+home+'#top">CVM <span>TAX</span></a><address>Schillinger Weg 35<br>54421 Reinsfeld</address><a href="mailto:info@cvm-tax.de">info@cvm-tax.de</a></div><nav aria-label="Einstieg"><h2>Dein nächster Schritt</h2><a href="'+home+'#preis">Preis prüfen</a><a href="'+home+'#leistungen">Leistungen kennenlernen</a><a href="'+home+'#so-gehts">Ablauf kennenlernen</a><a href="'+home+'#kontakt">Kontakt aufnehmen</a></nav><nav aria-label="Vorbereiten"><h2>Gut vorbereitet</h2><a href="ratgeber-unterlagen.html#prep-title">Unterlagen-Checkliste</a><a href="'+home+'#ratgeber">Ratgeber entdecken</a><a href="'+home+'#kanzlei">CVM TAX kennenlernen</a></nav></div><div class="shared-footer-bottom"><span>© '+new Date().getFullYear()+' CVM TAX</span><nav aria-label="Rechtliche Hinweise"></nav></div>';const target=inner.querySelector('.shared-footer-bottom nav');legal.forEach(a=>target.append(a));footer.replaceChildren(inner);footer.classList.add('shared-footer');})();
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
;
/* Quelle: assets/quality/06-email.js */
(()=>{const email=document.querySelector('#priceEmail');if(!email)return;const trim=()=>{email.value=email.value.trim()};email.addEventListener('blur',trim);document.querySelector('#next').addEventListener('click',trim,true);})();
;
/* Quelle: assets/quality/12-verbindung.js */
(()=>{const note=document.querySelector('[data-connection-note]');if(!note)return;const sync=()=>note.hidden=navigator.onLine!==false;addEventListener('online',sync);addEventListener('offline',sync);sync()})();
;
/* Quelle: assets/quality/13-zeichen.js */
(()=>{['priceMessage','otherSpecialDetails'].forEach(id=>{const field=document.getElementById(id);if(!field)return;const count=document.createElement('p');count.className='field-hint';count.id=id+'Count';count.setAttribute('aria-hidden','true');field.after(count);const sync=()=>count.textContent=field.value.length+' / '+field.maxLength+' Zeichen';field.addEventListener('input',sync);field.form?.addEventListener('reset',()=>requestAnimationFrame(sync));sync()})})();
;
/* Quelle: assets/quality/27-bewegung.js */
(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches){document.body.dataset.gsapPreview='off';document.body.dataset.atelier='off';return}const load=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script)});load('assets/vendor/gsap/gsap.min.js').then(()=>Promise.all(['ScrollTrigger','CustomEase','SplitText'].map(name=>load('assets/vendor/gsap/'+name+'.min.js')))).then(()=>load('assets/motion-design/design.js?v=47512b97db60')).then(()=>document.dispatchEvent(new Event('cvm-motion-ready'))).catch(()=>{document.body.dataset.gsapPreview='off';document.body.dataset.atelier='off'})})();
