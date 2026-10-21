(()=>{
 const header=document.querySelector('.nav'),toggle=document.querySelector('.tree-toggle'),menu=document.querySelector('#site-tree');
 const reserve=()=>{document.documentElement.style.setProperty('--nav-clearance',`${Math.ceil(header.offsetTop+header.offsetHeight+32)}px`);document.documentElement.style.setProperty('--nav-menu-top',`${Math.ceil(header.offsetTop+header.offsetHeight+12)}px`)};
 reserve();if('ResizeObserver'in window)new ResizeObserver(reserve).observe(header);
 const setMenu=open=>{menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Navigation schließen':'Navigation öffnen')};
 toggle.addEventListener('click',()=>setMenu(menu.hidden));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){setMenu(false);toggle.focus()}});
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))setMenu(false)});
 const sync=()=>header.classList.toggle('is-compact',scrollY>28);addEventListener('scroll',sync,{passive:true});sync();
 document.querySelector('#year').textContent=new Date().getFullYear();
})();
