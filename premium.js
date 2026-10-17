/* UI-only accessibility enhancements; no API or contact calls. */
(() => {
  'use strict';
  const menu=document.getElementById('menuButton');
  const nav=document.getElementById('navLinks');
  const closeMenu=()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');};
  nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
  const setView=(panel,view)=>{if(!panel)return;panel.dataset.mobileView=view;panel.querySelectorAll('[data-demo-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demoView===view)));};
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-demo-view]');
    if(toggle)setView(toggle.closest('.demo-panel'),toggle.dataset.demoView);
    const scenario=e.target.closest('.scenario-btn,.salon-scenarios button');
    if(scenario)setView(scenario.closest('.demo-panel'),'conversation');
    const anchor=e.target.closest('a[href^="#"]');
    if(anchor){try{zionOpenTarget(document.getElementById(decodeURIComponent(anchor.hash.slice(1))));}catch{}}
  },true);
  const openHash=()=>{try{zionOpenTarget(document.getElementById(decodeURIComponent(location.hash.slice(1))));}catch{}};
  window.addEventListener('hashchange',openHash);openHash();
  // The full data handling notice remains accessible without occupying the whole demo opening.
  const notice=document.querySelector('.live-demo-banner p');
  if(notice){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Como este teste usa IA e dados de demonstração';notice.before(details);details.append(summary,notice);}
  // Roving tabindex and arrow keys for the existing tab mechanism.
  const tabs=[...document.querySelectorAll('.demo-tab')];
  const updateTabs=()=>tabs.forEach(t=>{t.tabIndex=t.getAttribute('aria-selected')==='true'?0:-1;});
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',updateTabs);
    tab.addEventListener('keydown',e=>{
      let next;
      if(e.key==='ArrowRight')next=(index+1)%tabs.length;
      if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
      if(next!==undefined){e.preventDefault();tabs[next].click();tabs[next].focus();}
    });
  });
  new MutationObserver(updateTabs).observe(document.querySelector('.demo-tabs'),{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  updateTabs();
  // Trap focus in the existing guided presentation and restore the trigger on close.
  const dialog=document.getElementById('presentationOverlay');let lastFocus;
  new MutationObserver(()=>{
    if(!dialog.hidden){lastFocus=document.activeElement;dialog.setAttribute('aria-modal','true');dialog.querySelector('button')?.focus();}
    else{dialog.removeAttribute('aria-modal');lastFocus?.focus();}
  }).observe(dialog,{attributes:true,attributeFilter:['hidden']});
  dialog.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const buttons=[...dialog.querySelectorAll('button:not([disabled])')],first=buttons[0],last=buttons.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
})();
