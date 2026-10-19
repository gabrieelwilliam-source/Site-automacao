/* Discover the configured demonstration data without starting a booking. */
(()=>{
 'use strict';
 const demo=window.ZionLegacyDemo;if(!demo)return;
 const money=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 function catalog(segment){
  const panel=document.querySelector(`[data-panel="${segment}"]`)||document.querySelector(`#demo-${segment}`);
  // Use the existing chat container as a stable anchor across responsive layouts.
  const chat=document.getElementById(segment==='clinica'?'clinicChat':'leadChat');if(!chat)return;
  const root=chat.closest('.clinic-demo')||chat.closest('.realty-demo')||chat.parentElement;
  const strip=document.createElement('details');strip.className='demo-catalog';strip.id=segment+'Catalog';
  const summary=document.createElement('summary');summary.textContent=segment==='clinica'?'Ver serviços e valores':'Ver imóveis disponíveis';strip.append(summary);
  const note=document.createElement('p');note.className='demo-catalog-note';note.textContent=segment==='clinica'?'Serviços e valores do cenário demonstrativo. A indicação é individualizada.':'Carteira fictícia de aluguel · imagens ilustrativas · nenhuma visita real será marcada.';strip.append(note);
  const list=document.createElement('div');list.className='demo-catalog-grid';
  const items=segment==='clinica'?Object.values(demo.clinicServices):demo.realtyInventory;
  for(const item of items){
   const card=document.createElement('article');card.className='demo-catalog-card';
   if(segment==='imobiliaria'){const image=document.createElement('img');image.src=item.image;image.alt=item.title+' — imagem ilustrativa';image.loading='lazy';image.width=360;image.height=200;card.append(image);}
   const heading=document.createElement('h4');heading.textContent=item.label||item.title;card.append(heading);
   const detail=document.createElement('p');detail.textContent=segment==='clinica'?`${item.duration} min · ${item.requiresEvaluation?'a partir de ':''}${money(item.price)}`:`${item.region} · ${item.feature}`;card.append(detail);
   if(segment==='imobiliaria'){const price=document.createElement('strong');price.textContent=item.price;card.append(price);}
   const button=document.createElement('button');button.type='button';button.className='btn btn-ghost';button.textContent=segment==='clinica'?'Conhecer este serviço':'Ver este imóvel';
   button.addEventListener('click',async()=>{if(button.disabled)return;button.disabled=true;try{const message=segment==='clinica'?`Quero saber sobre ${item.label}`:`Quero ver os imóveis disponíveis, especialmente o imóvel ${item.id}: ${item.title}`;const result=await window.ZionDemoLive.send(segment,message);if(result){strip.open=false;chat.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}}finally{button.disabled=false;}});card.append(button);list.append(card);
  }
  strip.append(list);chat.before(strip);
 }
 catalog('clinica');catalog('imobiliaria');
})();
