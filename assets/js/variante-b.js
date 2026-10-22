/* Resolve text-size reflow independently from the fixed design-size layout. */
(()=>{const nav=document.querySelector('.nav'),links=nav.querySelector('.navlinks'),brand=nav.querySelector('.brand'),actions=nav.querySelector('.nav-right');let pending=false;const measure=()=>{pending=false;document.body.classList.toggle('b-large-text',parseFloat(getComputedStyle(document.documentElement).fontSize)>20);nav.classList.remove('b-nav-tight');if(getComputedStyle(links).display!=='none'){const l=links.getBoundingClientRect();if(l.left<brand.getBoundingClientRect().right+12||l.right>actions.getBoundingClientRect().left-12)nav.classList.add('b-nav-tight')}document.documentElement.style.setProperty('--b-header-height',nav.offsetHeight+'px')};const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(measure)}};const observer=new ResizeObserver(schedule);observer.observe(nav);observer.observe(document.documentElement);addEventListener('resize',schedule,{passive:true});document.fonts.ready.then(schedule);schedule()})();

/* Keep short price-check steps at least as tall as the opening question.
   Longer questions, validation messages and the review can grow naturally. */
(()=>{
  const region=document.querySelector('#questions');
  const first=region?.querySelector('[data-step="year"]');
  if(!first)return;
  let measuredWidth=0,measuredFont='';
  const reserveSpace=()=>{
    const width=region.clientWidth,font=getComputedStyle(document.documentElement).fontSize;
    if(!width||(width===measuredWidth&&font===measuredFont))return;
    measuredWidth=width;measuredFont=font;
    const sample=first.cloneNode(true);
    sample.hidden=false;sample.classList.add('active');sample.inert=true;sample.setAttribute('aria-hidden','true');
    sample.querySelectorAll('[id],[name]').forEach(field=>{field.removeAttribute('id');field.removeAttribute('name')});
    sample.querySelector('.step-error')?.remove();
    sample.style.cssText=`position:absolute;visibility:hidden;pointer-events:none;width:${width}px;`;
    region.append(sample);
    const height=Math.ceil(sample.getBoundingClientRect().height);
    sample.remove();
    region.style.setProperty('--price-step-min-height',height+'px');
  };
  new ResizeObserver(reserveSpace).observe(region);
  addEventListener('resize',reserveSpace,{passive:true});
  document.fonts.ready.then(()=>{measuredWidth=0;reserveSpace()});
  reserveSpace();
})();

/* End the approved ribbon background softly before the footer at every size. */
(()=>{
  const footer=document.querySelector('#footer');
  if(!footer)return;
  const fitBackground=()=>document.documentElement.style.setProperty('--b-footer-height',footer.offsetHeight+'px');
  new ResizeObserver(fitBackground).observe(footer);
  fitBackground();
})();
