/* Progressive presentation only: no external requests, customer data or workflow changes. */
(() => {
  'use strict';
  const root=document.documentElement;
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopQuery=window.matchMedia('(min-width: 821px)');
  const toggle=document.querySelector('.motion-toggle');
  let userReduced=false;
  try{userReduced=localStorage.getItem('zaion-motion')==='reduced';}catch{}
  const applyMotion=()=>{
    const reduced=motionQuery.matches||userReduced;
    root.classList.toggle('cinema-ready',!reduced);
    root.classList.toggle('cinema-static',reduced);
    if(reduced)document.querySelectorAll('[data-cinematic-enter],.brand-explorer-detail').forEach(el=>el.getAnimations?.().forEach(animation=>animation.cancel()));
    if(toggle){toggle.hidden=motionQuery.matches;toggle.setAttribute('aria-pressed',String(userReduced));toggle.textContent=userReduced?'Ativar movimento':'Reduzir movimento';}
  };
  toggle?.addEventListener('click',()=>{userReduced=!userReduced;try{localStorage.setItem('zaion-motion',userReduced?'reduced':'full');}catch{}applyMotion();});
  motionQuery.addEventListener?.('change',applyMotion);applyMotion();

  // Scenes never run on a timer: the reader controls them through scroll or buttons.
  const story=document.querySelector('.cinematic-story');
  const steps=[...document.querySelectorAll('[data-story-step]')];
  const selectors=[...document.querySelectorAll('[data-story-select]')];
  const scenes=[...document.querySelectorAll('[data-story-scene]')];
  const captions=['01 / CONVERSA','02 / CONTEXTO','03 / CONTINUIDADE'];
  const selectScene=index=>{
    if(!Number.isInteger(index)||index<0||index>=scenes.length)return;
    story.dataset.scene=String(index);
    steps.forEach((el,i)=>el.classList.toggle('is-active',i===index));
    selectors.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
    scenes.forEach((el,i)=>el.hidden=i!==index);
    story.style.setProperty('--story-progress',String((index+1)/scenes.length));
    const caption=story.querySelector('.story-stage-caption');if(caption)caption.textContent=captions[index];
  };
  const keyboardGroup=(buttons,select)=>buttons.forEach((button,index)=>button.addEventListener('keydown',event=>{
    const key=event.key;let next;
    if(key==='ArrowRight'||key==='ArrowDown')next=(index+1)%buttons.length;
    if(key==='ArrowLeft'||key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;
    if(key==='Home')next=0;if(key==='End')next=buttons.length-1;
    if(next!==undefined){event.preventDefault();select(next);buttons[next].focus({preventScroll:true});}
  }));
  if(story&&steps.length===scenes.length&&selectors.length===scenes.length){
    selectors.forEach((button,index)=>button.addEventListener('click',()=>selectScene(index)));
    keyboardGroup(selectors,selectScene);selectScene(0);story.classList.add('story-enhanced');
    if('IntersectionObserver' in window){
      const ratios=new Map();
      const sceneObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>ratios.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0));
        if(!desktopQuery.matches||root.classList.contains('cinema-static'))return;
        const best=steps.map((el,index)=>({index,ratio:ratios.get(el)||0})).sort((a,b)=>b.ratio-a.ratio)[0];
        if(best?.ratio>0&&story.dataset.scene!==String(best.index))selectScene(best.index);
      },{rootMargin:'-96px 0px -120px 0px',threshold:[0,.1,.4,.7,1]});
      steps.forEach(el=>sceneObserver.observe(el));
    }
  }

  // Brand text is read from the approved manual-derived definitions already on the page.
  const explorer=document.querySelector('.brand-explorer');
  const definitions=[...document.querySelectorAll('.brand-symbols dl>div')].map(row=>({label:row.querySelector('dt').textContent,description:row.querySelector('dd').textContent}));
  if(explorer&&definitions.length){
    const controls=explorer.querySelector('.brand-explorer-controls');
    const selectBrand=index=>{
      const item=definitions[index];if(!item)return;
      explorer.querySelector('[data-brand-label]').textContent=item.label;
      explorer.querySelector('[data-brand-description]').textContent=item.description;
      [...controls.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      const detail=explorer.querySelector('.brand-explorer-detail');
      if(!root.classList.contains('cinema-static')&&typeof detail.animate==='function')detail.animate([{opacity:.3,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
    };
    definitions.forEach((item,index)=>{const button=document.createElement('button');button.type='button';button.textContent=item.label;button.setAttribute('aria-pressed',String(index===1));button.addEventListener('click',()=>selectBrand(index));controls.append(button);});
    keyboardGroup([...controls.children],selectBrand);selectBrand(1);explorer.hidden=false;explorer.closest('.brand-meaning').classList.add('brand-interactive');
  }

  // Entry animations do not hide content before the observer runs; failure leaves it readable.
  if('IntersectionObserver' in window){
    const arrivalObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('cinematic-arrived');arrivalObserver.unobserve(entry.target);}
    }),{threshold:.12});
    document.querySelectorAll('[data-cinematic-enter]').forEach(el=>arrivalObserver.observe(el));
  }
})();
