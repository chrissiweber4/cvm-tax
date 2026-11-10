/* Quelle: assets/innovations/02-vorbereitung.js */
(()=>{const article=document.querySelector('article');if(!article)return;const groups=[['Grundausstattung',['Steueridentifikationsnummer','Bankverbindung','Letzter Steuerbescheid','Gegebenenfalls Schreiben des Finanzamts']],['Arbeitnehmer',['Lohnsteuerbescheinigungen aller Arbeitgeber','Berufliche Fahrten, Homeoffice und Fortbildungen','Arbeitsmittel, Fachliteratur und berufliche Technik','Bescheinigungen zu Lohnersatzleistungen','Doppelte Haushaltsführung oder beruflicher Umzug']],['Familie & Vorsorge',['Kinderbetreuung, falls relevant','Spendenbescheinigungen','Handwerker und haushaltsnahe Dienstleistungen','Selbst getragene Krankheitskosten','Versicherungsnachweise und elektronische Meldungen']],['Rente',['Rentenbezugsmitteilungen','Nachweise zur Krankenversicherung']],['Kapitaleinkünfte',['Jahressteuerbescheinigungen','Verlustbescheinigungen, falls relevant']],['Vermietung',['Mieteinnahmen','Darlehenszinsen','Hausgeld und Nebenkosten','Reparaturen und größere Baumaßnahmen']]];
const work=document.createElement('section');work.className='prep-workbench';work.setAttribute('aria-labelledby','prep-title');work.innerHTML='<h2 id="prep-title">Deine Unterlagen. Zum Abhaken.</h2><p>Wähle die Bereiche, die du vorbereiten möchtest. Die Liste ist eine allgemeine Orientierung; welche Nachweise du brauchst, klären wir persönlich.</p><fieldset class="prep-filters"><legend>Welche Bereiche passen zu dir?</legend></fieldset><p class="prep-count" role="status"></p><div class="prep-groups"></div><div class="prep-actions"><button type="button" data-prep-print>Liste drucken</button><button type="button" data-prep-reset>Häkchen zurücksetzen</button></div><p class="prep-note">Die Häkchen bleiben nur auf dieser geöffneten Seite. Unterlagen übermittelst du nach der Mandatsannahme über den vereinbarten Weg.</p>';
let openOnly=false;const openButton=document.createElement('button');openButton.type='button';openButton.textContent='Nur offene Punkte zeigen';openButton.setAttribute('aria-pressed','false');openButton.onclick=()=>{openOnly=!openOnly;openButton.setAttribute('aria-pressed',String(openOnly));openButton.textContent=openOnly?'Alle Punkte zeigen':'Nur offene Punkte zeigen';sync()};work.querySelector('.prep-actions').append(openButton);article.querySelector('.keypoints').before(work);const filters=work.querySelector('fieldset'),container=work.querySelector('.prep-groups');groups.forEach(([label,items],i)=>{const option=document.createElement('label'),filter=document.createElement('input');filter.type='checkbox';filter.checked=i<2;filter.dataset.group=String(i);option.append(filter,document.createTextNode(label));filters.append(option);const group=document.createElement('section');group.dataset.prepGroup=String(i);const h=document.createElement('h3');h.textContent=label;const badge=document.createElement('span');badge.className='prep-group-count';badge.setAttribute('aria-hidden','true');h.append(badge);group.append(h);items.forEach(text=>{const row=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.prepItem='';row.append(input,document.createTextNode(text));group.append(row);});container.append(group);});
const sync=()=>{const active=[...filters.querySelectorAll('input:checked')].map(e=>e.dataset.group);container.querySelectorAll('section').forEach(e=>e.hidden=!active.includes(e.dataset.prepGroup));container.querySelectorAll(':scope > section').forEach(group=>{const inputs=[...group.querySelectorAll('input')],checked=inputs.filter(e=>e.checked).length;group.querySelector('.prep-group-count').textContent=checked+' / '+inputs.length;group.dataset.complete=String(checked===inputs.length)});const fields=[...container.querySelectorAll(':scope > section:not([hidden]) input')];const checked=fields.filter(e=>e.checked).length;work.querySelector('.prep-count').textContent=fields.length?checked+' von '+fields.length+' Punkten abgehakt':'Wähle mindestens einen Bereich für deine Liste.';container.querySelectorAll('label').forEach(row=>row.hidden=openOnly&&row.querySelector('input').checked);};work.addEventListener('change',sync);work.querySelector('[data-prep-reset]').onclick=()=>{container.querySelectorAll('input').forEach(e=>e.checked=false);sync();};work.querySelector('[data-prep-print]').onclick=()=>window.print();sync();})();
;
/* Quelle: assets/innovations/03-lesen.js */
(()=>{const article=document.querySelector('article');if(!article)return;const headings=[...article.querySelectorAll('h2')];if(!headings.length)return;const aside=document.createElement('aside');aside.className='reading-map';aside.innerHTML='<details><summary>Im Artikel springen</summary><nav aria-label="Kapitelübersicht"></nav></details><div class="reading-progress"><label for="reading-progress">Dein Lesefortschritt</label><progress id="reading-progress" max="100" value="0"></progress></div>';article.before(aside);headings.forEach((h,i)=>{if(!h.id)h.id='kapitel-'+(i+1);const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;aside.querySelector('nav').append(a);});const chapterCount=document.createElement('span');chapterCount.className='reading-chapter-count';chapterCount.textContent=headings.length+' Kapitel';aside.querySelector('summary').append(chapterCount);const details=aside.querySelector('details'),media=matchMedia('(min-width:1100px)');details.open=media.matches;media.addEventListener('change',()=>details.open=media.matches);aside.addEventListener('click',e=>{if(e.target.closest('a')&&!media.matches)details.open=false;});let pending=false;const sync=()=>{pending=false;const r=article.getBoundingClientRect();const max=Math.max(1,article.offsetHeight-innerHeight+140);aside.querySelector('progress').value=Math.max(0,Math.min(100,(-r.top+140)/max*100));let current=headings[0];for(const h of headings)if(h.getBoundingClientRect().top<190)current=h;aside.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+current.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});};addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(sync);}},{passive:true});sync();})();
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
/* Quelle: assets/quality/21-quellen.js */
(()=>{document.querySelectorAll('article a[target="_blank"]').forEach(a=>{const label=a.textContent.trim();a.setAttribute('aria-label',label+' (öffnet in neuem Tab)');a.setAttribute('title','Öffnet in neuem Tab');a.rel=[...new Set((a.rel||'').split(' ').filter(Boolean).concat('noopener'))].join(' ');const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.classList.add('source-external');icon.innerHTML='<path d="M14 4h6v6M20 4L10 14M20 14v6H4V4h6"/>';a.append(icon)})})();
