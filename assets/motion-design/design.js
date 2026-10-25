(() => {
  const panel=document.querySelector('.motion-preview');
  const main=document.querySelector('main');
  if(!main)return;
  const controlled=!!panel&&new URLSearchParams(location.search).has('studio');
  if(controlled){document.body.dataset.motionStudio='true';document.documentElement.dataset.motionStudio='true';}
  const toggle=panel?.querySelector('[data-motion-toggle]');
  const replay=panel?.querySelector('[data-motion-replay]');
  const status=panel?.querySelector('[data-motion-status]');
  const {gsap,ScrollTrigger,CustomEase,SplitText}=window;
  if(panel){
    panel.hidden=false;
    new ResizeObserver(()=>document.documentElement.style.setProperty('--motion-preview-clearance',`${panel.offsetHeight+24}px`)).observe(panel);
  }
  if(!gsap||!ScrollTrigger||!CustomEase||!SplitText){if(toggle)toggle.disabled=true;if(replay)replay.disabled=true;if(status)status.textContent='Statische Ansicht';return;}
  gsap.registerPlugin(ScrollTrigger,CustomEase,SplitText);
  const ease=CustomEase.create('cvm-focus-out','.23,1,.32,1');
  const travelEase=CustomEase.create('cvm-in-out','.77,0,.175,1');
  const clamp=gsap.utils.clamp(0,1);
  let enabled=true,media,previewRender;
  try{enabled=!panel||controlled||sessionStorage.getItem('cvm-premium-04')!=='off';}catch{}

  function start(){
    media?.revert();previewRender=null;
    document.body.dataset.atelier='off';
    document.body.dataset.gsapPreview=enabled?'on':'off';
    if(toggle)toggle.checked=enabled;if(replay)replay.disabled=!enabled;
    if(!enabled){if(status)status.textContent='Statische Ansicht';return;}
    media=gsap.matchMedia();
    media.add({reduced:'(prefers-reduced-motion: reduce)',wide:'(min-width:1100px) and (min-height:850px)',mobile:'(max-width:759px)',all:'all'},context=>{
      const {reduced,wide,mobile}=context.conditions;
      document.body.dataset.gsapReduced=String(reduced);
      document.body.dataset.atelier=reduced?'off':'on';
      if(status)status.textContent=reduced?'Reduzierte Bewegung':'Motion Edition 04';
      const splits=[],listeners=[],all=[],effects=new Map(),liveTargets=new Map();
      const hero=main.querySelector('.hero');
      const app=main.querySelector('.app-insight-a2');
      const section={process:main.querySelector('#so-gehts'),pricing:main.querySelector('#preis'),services:main.querySelector('#leistungen'),credentials:main.querySelector('#kanzlei'),guides:main.querySelector('#ratgeber'),contact:main.querySelector('#kontakt')};
      const targets={hero,price:hero,how:hero,...section,documents:app,hub:app,portal:app};
      const watch=(el,event,fn)=>{el.addEventListener(event,fn);listeners.push(()=>el.removeEventListener(event,fn));};
      const visible=el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;};
      const timeline=(id,target)=>{
        const tl=gsap.timeline({paused:true,defaults:{ease},id:`cvm-${id}`});
        all.push(tl);effects.set(id,tl);
        if(target)liveTargets.set(id,target);
        return tl;
      };
      const words=heading=>{
        const label=heading.innerText.replace(/\s+/g,' ').trim();
        const split=SplitText.create(heading,{type:'words',wordsClass:'premium-word'});heading.setAttribute('aria-label',label);splits.push(split);return split.words;
      };
      const focusHeading=(tl,heading,at=0)=>{
        if(!heading)return;
        tl.from(words(heading),{opacity:0,filter:'blur(4px)',duration:.65,stagger:.045,clearProps:controlled?'':'opacity,filter'},at);
      };
      const draw=(tl,nodes,at=0,duration=.8,stagger=.06)=>{
        const elements=[...nodes];
        for(const node of elements){if(!node.hasAttribute('pathLength'))node.setAttribute('pathLength','1');}
        if(elements.length)tl.fromTo(elements,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration,stagger,ease},at);
      };
      const ring=(tl,nodes,at=0)=>{if(nodes.length)tl.fromTo(nodes,{opacity:0,scale:.92},{opacity:.7,scale:1,duration:.4,stagger:.08},at).to(nodes,{opacity:0,scale:1.08,duration:.5,stagger:.08},at+.4);};
      function measure(){
        const rule=hero.querySelector('.premium-hero-rule');if(rule)rule.style.top=`${hero.querySelector('h1').offsetTop+hero.querySelector('h1').offsetHeight+14}px`;
        for(const svg of main.querySelectorAll('.premium-frame')){
          const parent=svg.parentElement;const w=parent.offsetWidth,h=parent.offsetHeight;
          svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
          const rect=svg.querySelector('rect');rect.setAttribute('x','.5');rect.setAttribute('y','.5');rect.setAttribute('width',Math.max(0,w-1));rect.setAttribute('height',Math.max(0,h-1));
        }
      }
      measure();
      const measureObserver=new ResizeObserver(measure);
      for(const el of main.querySelectorAll('.premium-surface'))measureObserver.observe(el);
      listeners.push(()=>measureObserver.disconnect());

      const nav=main.ownerDocument.querySelector('.navlinks');
      const indicator=nav?.querySelector('.premium-nav-indicator');
      let navActive=null;
      const setNav=(id,animate=false)=>{
        navActive=id;
        if(!indicator)return;
        const link=nav.querySelector(`a[href="#${id}"]`);
        const values=link?{x:link.offsetLeft+(link.offsetWidth-24)/2,opacity:.7}:{opacity:0};
        if(animate&&!reduced)gsap.to(indicator,{...values,duration:.2,ease,overwrite:true});else gsap.set(indicator,values);
      };
      if(!controlled&&!reduced&&indicator){
        for(const [key,id] of Object.entries({pricing:'preis',services:'leistungen',credentials:'kanzlei',guides:'ratgeber'}))ScrollTrigger.create({trigger:section[key],start:'top 42%',end:'bottom 42%',onToggle:self=>{if(self.isActive)setNav(id,true);else if(navActive===id)setNav(null,true);}});
        for(const link of nav.querySelectorAll('a')){
          watch(link,'pointerenter',()=>{const saved=navActive;setNav(link.hash.slice(1),true);navActive=saved;});
          watch(link,'pointerleave',()=>setNav(navActive,true));
          watch(link,'focusin',()=>{const saved=navActive;setNav(link.hash.slice(1));navActive=saved;});
          watch(link,'focusout',()=>setNav(navActive));
        }
      }
      let intro,scene;
      if(!reduced){
        intro=timeline('hero');
        const heading=hero.querySelector('h1');const label=heading.innerText.replace(/\s+/g,' ').trim();
        const split=SplitText.create(heading,{type:'chars',charsClass:'premium-glyph'});heading.setAttribute('aria-label',label);splits.push(split);
        intro.from(heading,{scale:1.025,rotationX:4,transformPerspective:1200,transformOrigin:'center bottom',duration:.95,clearProps:controlled?'':'transform'},0)
          .from(split.chars,{opacity:0,duration:.7,stagger:.018,clearProps:controlled?'':'opacity'},.05)
          .from(hero.querySelector('.eyebrow'),{opacity:0,duration:.55},0)
          .from(hero.querySelector('.hero-copy'),{opacity:0,duration:.7},.35)
          .fromTo(hero.querySelector('.premium-hero-rule'),{scaleX:.08,opacity:0},{scaleX:1,opacity:.5,duration:.85},.15)
          .to(hero.querySelector('.premium-hero-rule'),{opacity:0,duration:.5},1)
          .from(hero.querySelectorAll('.b-trust-pills li>span'),{opacity:0,duration:.45,stagger:.065},.55);
        draw(intro,hero.querySelectorAll('.b-check path'),.45,.5,.07);
        if(!controlled&&visible(hero))intro.play();else if(!controlled)intro.progress(1);
        const process=timeline('process',section.process);
        focusHeading(process,section.process.querySelector('h2'),0);
        const steps=section.process.querySelectorAll('.step');
        for(let i=0;i<steps.length;i++){
          const node=steps[i];
          process.from(node.querySelectorAll('h3,p,.b-text-link,details'),{opacity:0,duration:.5,stagger:.04},.25+i*.23);
          ring(process,[node.querySelector('.step-ring')],.2+i*.35);
        }
        const pricing=timeline('pricing',section.pricing);
        focusHeading(pricing,section.pricing.querySelector('h2'),0);
        draw(pricing,section.pricing.querySelectorAll('.premium-frame rect'),.12,1.25,0);
        pricing.to(section.pricing.querySelectorAll('.premium-frame'),{opacity:0,duration:.5},1.4);
        draw(pricing,section.pricing.querySelectorAll('.b-price-points .b-check path'),.4,.6,.08);
        pricing.from(section.pricing.querySelectorAll('.calc-copy>p:not(.section-kicker),.b-price-points>li>span'),{opacity:0,duration:.55,stagger:.04},.25);
        const services=timeline('services',section.services);
        focusHeading(services,section.services.querySelector('h2'),0);
        draw(services,section.services.querySelectorAll('.premium-frame rect'),.08,1.2,.075);
        services.to(section.services.querySelectorAll('.premium-frame'),{opacity:0,duration:.5},1.4);
        draw(services,section.services.querySelectorAll('.premium-service-glyph path,.premium-service-glyph circle'),.18,.85,.06);
        services.from(section.services.querySelectorAll('.service h3,.service>p'),{opacity:0,duration:.55,stagger:.045},.3);
        const credentials=timeline('credentials',section.credentials);
        focusHeading(credentials,section.credentials.querySelector('h2'),0);
        draw(credentials,section.credentials.querySelectorAll('svg:not(.premium-seal) path,svg:not(.premium-seal) circle'),.1,.75,.035);
        draw(credentials,section.credentials.querySelectorAll('.premium-seal circle'),.05,1.1,.075);
        credentials.from(section.credentials.querySelectorAll('.cvm-credentials h3,.cvm-credentials p'),{opacity:0,duration:.55,stagger:.045},.28);
        const guides=timeline('guides',section.guides);
        focusHeading(guides,section.guides.querySelector('h2'),0);
        const articles=[...section.guides.querySelectorAll('.article')];
        articles.forEach((article,i)=>{
          guides.from(article.querySelectorAll('.meta,.article-description,.article-read'),{opacity:0,duration:.5,stagger:.04},.2+i*.07);
          guides.from(words(article.querySelector('.article-title')),{opacity:0,filter:'blur(3px)',duration:.45,stagger:.025,clearProps:controlled?'':'opacity,filter'},.15+i*.075);
          draw(guides,article.querySelectorAll('.premium-bookmark path'),.1+i*.08,.65,0);
          guides.fromTo(article.querySelector('.premium-reading-line'),{scaleX:0},{scaleX:.18,duration:.8},.2+i*.07);
        });
        const contact=timeline('contact',section.contact);
        focusHeading(contact,section.contact.querySelector('h2'),0);
        contact.from(section.contact.querySelector('.b-contact-lead'),{opacity:0,duration:.5},.25);
        draw(contact,section.contact.querySelectorAll('.premium-orbit circle'),.85,.5,0);
        contact.fromTo(section.contact.querySelectorAll('.premium-orbit circle'),{opacity:0},{opacity:.5,duration:.35},.85).to(section.contact.querySelectorAll('.premium-orbit circle'),{opacity:0,duration:.35},1.4);

        const portal=app.querySelector('.app-overview'),art=app.querySelector('.atelier-art'),docs=[...app.querySelectorAll('.atelier-document')],hub=app.querySelector('.atelier-hub'),chapters=[...app.querySelectorAll('.atelier-chapters li')],access=app.querySelector('.app-a2-access');
        const pin=!controlled&&wide&&app.offsetHeight<innerHeight-170-(panel?.offsetHeight||0)&&parseFloat(getComputedStyle(document.documentElement).fontSize)<=20;
        document.body.dataset.atelierMode=pin?'scroll':'auto';
        const factor=mobile?.48:1;
        gsap.set(portal,{opacity:0,scale:.68,rotationY:-15,rotationX:8,y:55,transformPerspective:1400});
        gsap.set(access,{opacity:0});gsap.set(hub,{opacity:0,scale:.8,rotation:-12});
        gsap.set(docs[0],{x:-88*factor,y:-46*factor,rotation:-16,rotationY:8});gsap.set(docs[1],{x:14*factor,y:-90*factor,rotation:6,rotationY:-8});gsap.set(docs[2],{x:94*factor,y:90*factor,rotation:16,rotationY:-12});
        scene=gsap.timeline({id:'atelier-product-scene',paused:!pin,defaults:{ease},scrollTrigger:pin?{trigger:app,start:'top 125px',end:'+=1150',pin:true,pinType:'transform',pinSpacing:true,scrub:.3,invalidateOnRefresh:true,anticipatePin:1}:undefined});
        all.push(scene);
        scene.to(chapters[0],{color:'#164f49',duration:.15},0).to(chapters[0].querySelector('i'),{scaleX:1,duration:.8,ease:'none'},0)
          .to(docs[0],{x:-125*factor,y:-30*factor,rotation:-22,rotationY:15,duration:.8},0)
          .to(docs[1],{x:14*factor,y:-110*factor,rotation:2,rotationY:-10,duration:.8},0)
          .to(docs[2],{x:128*factor,y:105*factor,rotation:22,rotationY:-15,duration:.8},0)
          .to(app.querySelectorAll('.atelier-orbit'),{rotationZ:45,scale:1.04,duration:2.2,ease:'none'},0)
          .to(chapters[0],{color:'#7c8985',duration:.2},.85).to(chapters[1],{color:'#164f49',duration:.2},.85)
          .to(chapters[1].querySelector('i'),{scaleX:1,duration:.95,ease:'none'},.85)
          .to(docs,{x:0,y:0,rotation:0,rotationY:0,scale:.55,opacity:0,duration:.9,stagger:.075},.8)
          .to(hub,{opacity:1,scale:1,rotation:0,duration:.8},.95)
          .to(hub,{rotationY:12,rotationX:-6,scale:1.04,duration:.55},1.6)
          .to(hub,{opacity:0,scale:.85,duration:.5},2.03)
          .to(portal,{opacity:1,scale:1,rotationY:0,rotationX:0,y:0,duration:1.05},2.08)
          .to(art,{opacity:0,duration:.5},2.28)
          .from(portal.querySelectorAll('.overview-rows>li'),{y:12,opacity:0,duration:.5,stagger:.065},2.48)
          .to(chapters[1],{color:'#7c8985',duration:.2},2.25).to(chapters[2],{color:'#164f49',duration:.2},2.25)
          .to(chapters[2].querySelector('i'),{scaleX:1,duration:1,ease:'none'},2.25)
          .to(access,{opacity:1,duration:.5},2.95)
          .fromTo(app.querySelector('.atelier-corona'),{opacity:0,scale:.6},{opacity:.6,scale:1,duration:.7},1.05)
          .to(app.querySelector('.atelier-corona'),{opacity:0,scale:1.35,duration:.7},1.75)
          .fromTo(app.querySelectorAll('.document-sheen'),{xPercent:-160},{xPercent:180,duration:1.15,stagger:.08,ease:'power1.inOut'},0)
          .fromTo(portal.querySelector('.portal-sheen'),{xPercent:-180,opacity:0},{xPercent:0,opacity:.7,duration:.5},2.12)
          .to(portal.querySelector('.portal-sheen'),{xPercent:180,opacity:0,duration:.8},2.62);
        if(!controlled&&!pin){
          let seen=false;const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){seen=true;if(!document.hidden)scene.play();}else if(seen)scene.pause();},{threshold:.3});observer.observe(app.querySelector('.atelier-stage'));listeners.push(()=>observer.disconnect());
          watch(document,'visibilitychange',()=>{if(document.hidden)scene.pause();else if(seen&&visible(app))scene.play();});
        }
      }

      if(!controlled&&!reduced){
        for(const [id,target] of liveTargets){
          const tl=effects.get(id);const box=target.getBoundingClientRect();
          if(box.bottom<0)tl.progress(1).pause();
          else ScrollTrigger.create({trigger:target,start:'top 86%',once:true,onEnter:()=>tl.play()});
        }
        if(app.getBoundingClientRect().bottom<0)scene?.progress(1);
        ScrollTrigger.refresh();
        if(location.hash){
          let anchor;try{anchor=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
          if(anchor){for(const [id,target] of liveTargets)if(target.contains(anchor)||anchor.contains(target))effects.get(id).progress(1);
            window.scrollTo({top:Math.max(0,anchor.getBoundingClientRect().top+scrollY-110),behavior:'instant'});}
        }
      }
      const buttonDemo=gsap.timeline({paused:true});all.push(buttonDemo);
      let selected=null,fromY=0,toY=0,travelPart=0,panEnd=0;
      function finish(){
        gsap.set(hero.querySelector('.btn-dark'),{backgroundColor:'#164f49'});gsap.set(hero.querySelector('.btn-ghost'),{backgroundColor:'rgba(255,255,255,.62)'});
        for(const tl of all)tl.progress(1).pause();
        for(const button of main.querySelectorAll('.premium-button')){button.removeAttribute('data-motion-demo');gsap.set(button.querySelectorAll('.premium-orbit circle'),{opacity:0,strokeDashoffset:1});}
      }
      if(controlled){
        finish();
        previewRender=(id,value=0,options={})=>{
          const target=targets[id];if(!target)return;
          const p=clamp(value);
          if(selected!==id||options.reset){
            const startY=scrollY;finish();selected=id;setNav({pricing:'preis',services:'leistungen',credentials:'kanzlei',guides:'ratgeber'}[id]||null);
            const top=target.getBoundingClientRect().top+scrollY;
            toY=['hero','price','how'].includes(id)?0:Math.max(0,top-(['documents','hub','portal'].includes(id)?125:110));
            toY=Math.min(toY,Math.max(0,document.documentElement.scrollHeight-innerHeight));
            fromY=options.instant||reduced?toY:startY;
            const duration=window.CVMMotionScenes.find(item=>item.id===id)?.duration||3;
            travelPart=Math.abs(fromY-toY)>16?Math.min(.24,.55/duration):0;
            panEnd=id==='guides'?Math.max(toY,top+target.offsetHeight-innerHeight+80):toY;
          }
          if(options.instant){fromY=toY;travelPart=0;}
          const q=travelPart?clamp(p/travelPart):1;
          window.scrollTo({top:fromY+(toY-fromY)*travelEase(q),behavior:'instant'});
          if(reduced)return;
          const t=clamp((p-travelPart)/(1-travelPart));
          if(effects.has(id))effects.get(id).progress(t).pause();
          if(id==='price'||id==='how'){
            const button=hero.querySelector(id==='price'?'.btn-dark':'.btn-ghost');
            const rise=clamp(t/.3),fall=1-clamp((t-.65)/.35);const v=ease(Math.min(rise,fall));
            gsap.set(button.querySelectorAll('.premium-orbit circle'),{opacity:v*.65,strokeDashoffset:1-v});
            gsap.set(button,{backgroundColor:id==='price'?gsap.utils.interpolate('#164f49','#24665a',v):`rgba(255,255,255,${.62+v*.3})`});
          }
          if(id==='guides'&&panEnd>toY&&t>.3)window.scrollTo({top:toY+(panEnd-toY)*clamp((t-.3)/.7),behavior:'instant'});
          const ranges={documents:[0,.8],hub:[.8,2.08],portal:[2.08,3.45]};
          if(scene&&ranges[id])scene.time(ranges[id][0]+t*(ranges[id][1]-ranges[id][0])).pause();
        };
        window.CVMMotion={ready:true,version:4,reduced,render:(id,p,options)=>previewRender?.(id,p,options)};
        window.dispatchEvent(new Event('cvm-motion-ready'));
      }else{
        if(!reduced&&matchMedia('(hover:hover) and (pointer:fine)').matches){
          for(const card of main.querySelectorAll('.service,.article')){
            const light=card.querySelector('.premium-card-light');if(!light)continue;
            const x=gsap.quickTo(light,'x',{duration:.3,ease}),y=gsap.quickTo(light,'y',{duration:.3,ease});let box;
            watch(card,'pointerenter',()=>{box=card.getBoundingClientRect();gsap.to(light,{opacity:1,duration:.18,ease});});
            watch(card,'pointermove',event=>{if(box){x(event.clientX-box.left-120);y(event.clientY-box.top-120);}});
            watch(card,'pointerleave',()=>{box=null;gsap.to(light,{opacity:0,duration:.18,ease});});
          }
        }
        watch(main,'focusin',event=>{
          if(hero.contains(event.target))intro?.progress(1);
          for(const [id,target] of Object.entries(section))if(target.contains(event.target))effects.get(id)?.progress(1);
          if(app.contains(event.target)){scene?.scrollTrigger?.disable(false);scene?.progress(1);}
        });
        watch(document.querySelector('.tree-toggle'),'click',event=>{
          if(!event.detail||reduced)return;queueMicrotask(()=>{const menu=document.querySelector('.site-tree');if(!menu.hidden)menu.animate([{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)'});});
        });
        watch(main,'click',event=>{
          if(!event.detail||reduced||!event.target.closest('.calc-nav'))return;
          queueMicrotask(()=>{const question=main.querySelector('.question.active');question?.animate([{opacity:.7},{opacity:1}],{duration:160,easing:'ease-out'});});
        });
        if(panel)watch(panel.querySelector('[data-graphic-jump]'),'click',event=>{
          event.preventDefault();if(scene?.scrollTrigger){window.scrollTo({top:scene.scrollTrigger.start+1,behavior:'instant'});ScrollTrigger.update();}else{app.scrollIntoView({block:'start',behavior:'instant'});scene?.restart();}
        });
      }
      return()=>{for(const remove of listeners)remove();for(const split of splits)split.revert();document.body.dataset.atelier='off';};
    });
  }
  toggle?.addEventListener('change',()=>{enabled=toggle.checked;try{sessionStorage.setItem('cvm-premium-04',enabled?'on':'off');}catch{}start();});
  replay?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'instant'});history.replaceState(null,'',location.pathname);start();});
  window.addEventListener('pagehide',()=>media?.revert());window.addEventListener('pageshow',event=>{if(event.persisted)start();});
  let width=innerWidth,font=getComputedStyle(document.documentElement).fontSize,timer;
  new ResizeObserver(()=>{const next=getComputedStyle(document.documentElement).fontSize;if(width!==innerWidth||font!==next){width=innerWidth;font=next;clearTimeout(timer);timer=setTimeout(start,160);}}).observe(document.documentElement);
  document.fonts.ready.then(start);
})();
