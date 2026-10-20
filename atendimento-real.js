/* Real AI via isolated n8n demo. No API credentials or production customer routes. */
(() => {
 'use strict';
 const {clinic,lead,realtyInventory,clinicChat,leadChat}=window.ZionLegacyDemo;
 const endpoint='https://n8n.vps12198.panel.icontainer.cloud/webhook/zion-demonstracao-conversa-v1';
 const ids={},busy={},states={},revisions={},controllers={},segmentNames={clinica:'Clínica',imobiliaria:'Imobiliária',salao:'Salão'};
 const session=seg=>ids[seg]||(ids[seg]='demo_'+crypto.randomUUID().replaceAll('-',''));
 const el=id=>document.getElementById(id),status=msg=>{el('liveDemoStatus').textContent=msg;};
 const dateLabel=value=>String(value||'').replace(/^(\d{4})-(\d{2})-(\d{2})$/,'$3/$2/$1');
 const current=()=>document.querySelector('.demo-tab.active')?.dataset.demo||'clinica';
 function add(seg,text,who){if(seg==='salao')return window.ZionSalonView.add(text,who==='user'?'client':who==='owner'?'owner':'assistant');if(seg==='clinica')return clinicAddMsg(text,who);return realtyMsg(text,who);}
 function apply(seg,result){const s=result.state;states[seg]=s;
  if(seg==='salao'){const a=s.booking?.ready?{status:'requested',date:s.booking.date,time:s.booking.time}:s.appointment;window.ZionSalonView.apply({...s,appointment:a?{...a,date:dateLabel(a.date)}:null},result.reason||result.notice);return;}
  if(seg==='clinica'){
   clinic.handoff=s.human;clinic.intent=s.intent;clinic.stage=s.human?'Atendimento humano':s.booking?'Solicitação em andamento':s.appointment?.status==='confirmed'?'Agendado':s.appointment?'Aguardando confirmação':'Conversa';clinic.date=s.appointment?dateLabel(s.appointment.date):null;clinic.time=s.appointment?.time;clinic.status=({requested:'Solicitado',confirmed:'Confirmado na demonstração',cancel_requested:'Cancelamento solicitado'})[s.appointment?.status]||'Em atendimento';clinic.action=s.human?'Equipe assume':s.appointment?'Conferir o pedido':'Continuar conversa';clinic.customer='Visitante';clinic.serviceKey=null;clinic.interestKey=null;
   clinic.appointment=s.appointment?{service:s.appointment.service||s.service,date:dateLabel(s.appointment.date),time:s.appointment.time,protocol:s.appointment.protocol||'DEMO · sem reserva real',status:clinic.status}:null;
   updateClinicPanel();el('ctxInterest').textContent=s.service||'A definir';el('clinicConfidence').textContent='IA real';el('clinicConfidence').previousElementSibling.textContent='ATENDIMENTO';traceClinic('Atendimento atualizado',result.reason||s.intent,'done',typeof result.elapsedMs==='number'?(result.elapsedMs/1000).toFixed(1).replace('.',',')+' s':'concluído');setClinicQuick(s.human?[]:[{label:'Tirar outra dúvida',value:'Tenho outra dúvida'},{label:'Ver horários',value:'Quais horários vocês têm?'},{label:'Falar com uma pessoa',value:'Quero falar com um atendente'}]);
  }else{
   const p=s.lead||{};Object.assign(lead,{intent:p.purpose||null,type:p.type||null,region:p.region||null,bedrooms:p.bedrooms||null,budget:p.budget||null,timeline:p.timeline||null,selected:realtyInventory.find(x=>x.id===s.selectedProperty)||null,visit:s.visit||null});updateCRM();
   el('realtyCrmState').textContent=s.human?'Equipe assume':s.visit?.status==='confirmed'?'Visita demonstrativa confirmada':'Perfil em construção';el('leadTemperature').textContent=s.human?'Humano':'Conversa com IA';
   const purpose=String(p.purpose||'').toLowerCase();let list=[];
   if(/alug|loca/.test(purpose)&&p.type){
    let max=Infinity;const amounts=String(p.budget||'').match(/\d+(?:[.,]\d+)*/g)||[];
    if(amounts.length){const nums=amounts.map(x=>Number(x.replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'))*(/mil/i.test(p.budget)&&Number(x.replace(',','.'))<100?1000:1));max=Math.max(...nums);}
    list=realtyInventory.filter(x=>x.type===p.type&&(!p.bedrooms||x.bedrooms>=p.bedrooms)&&x.numeric<=max&&(!p.region||/sem prefer|qualquer/i.test(p.region)||x.region.toLowerCase()===String(p.region).toLowerCase()));
   }
   if(Array.isArray(s.propertyMatches))list=realtyInventory.filter(p=>s.propertyMatches.includes(p.id));
   if(p.purpose==='Compra')list=list.map(item=>({...item,numeric:item.salePrice,price:Number(item.salePrice).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),tag:'Compra'}));
   window.ZionDemoCatalog?.setPurpose(p.purpose||s.catalogPurpose||'Aluguel');
   if(s.selectedProperty&&s.showProperties!==true)list=list.filter(item=>item.id===s.selectedProperty);
   el('propertyMatches').hidden=!list.length;
   if(list.length){
    el('matchCount').textContent=list.length+(list.length===1?' opção':' opções');el('propertyList').replaceChildren();
    const cards=renderInlineProperties(list,{inline:s.showProperties!==false});
    const qualified=!!(p.purpose&&p.type&&p.region&&p.bedrooms&&p.budget);
    if(!qualified)cards.querySelectorAll('.lead-inline-property').forEach((card,i)=>{card.classList.remove('best');card.querySelector('.lead-inline-property-top span').textContent='Imóvel '+list[i].id;});
    cards.querySelector('.lead-inline-label').textContent=s.selectedProperty?'IMÓVEL EM CONVERSA':qualified?'IMÓVEIS PARA O SEU PERFIL':'OPÇÕES DA CARTEIRA';
    cards.querySelectorAll('.lead-inline-property').forEach(card=>el('propertyList').append(card.cloneNode(true)));bindPropertyButtons();
    el('propertyMatches').querySelector('h3').textContent=s.selectedProperty?'Imóvel em conversa':qualified?'Compatíveis com o perfil':'Opções da carteira';
   }
   if(lead.selected&&!s.human&&!s.visit)setLeadOptions([{label:'Tirar uma dúvida',value:'Tenho uma dúvida sobre esse imóvel'},{label:'Consultar visita',value:'Quero marcar uma visita nesse imóvel'},{label:'Falar com corretor',value:'Quero falar com uma pessoa'}]);else setLeadOptions([]);
   el('visitPreview').hidden=!s.visit;
   if(s.visit){el('visitProperty').textContent=lead.selected?.title||'Imóvel a conferir';el('visitDate').textContent=dateLabel(s.visit.date)||'A definir';el('visitTime').textContent=s.visit.time||'A definir';el('visitProtocol').textContent=s.visit.status==='confirmed'?'Confirmação demonstrativa · sem reserva real':'Solicitação demonstrativa · aguarda confirmação';}
   if(s.human){el('handoff').textContent='Conversa encaminhada à equipe demonstrativa. A Iana fica pausada.';}
  }
 }
 async function request(seg,message,extra={}){
  if(busy[seg])return null;const started=Date.now();busy[seg]=true;status(segmentNames[seg]+': consultando a assistente…');
  const revision=revisions[seg]||0;const controller=new AbortController();controllers[seg]=controller;const timer=setTimeout(()=>controller.abort(),60000);
  const box=seg==='salao'?el('salonMessages'):seg==='clinica'?el('clinicChat'):el('leadChat'),indicator=document.createElement('p');indicator.className='live-typing';indicator.textContent='Iana está digitando…';box.append(indicator);box.setAttribute('aria-busy','true');box.scrollTop=box.scrollHeight;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({session:session(seg),segment:seg,message,...extra}),signal:controller.signal});const result=await response.json();result.elapsedMs=Date.now()-started;
   if((revisions[seg]||0)!==revision)return null;
   if(!response.ok||!result.ok)throw Error(result.error||'Não foi possível acessar a assistente.');
   box.querySelectorAll('.live-request-error').forEach(n=>n.remove());if(result.reply)add(seg,result.reply,extra.action?'owner':'bot');if(result.state)apply(seg,result);
   status(result.state?.human?'Conversa com a equipe demonstrativa · assistente pausada':result.mode==='context_rules'?'Atendimento conectado · resposta validada': 'Atendimento conectado · dados de demonstração');
   recordDemo(seg,'Interação com IA real · dados de demonstração');return result;
  }catch(err){if((revisions[seg]||0)!==revision)return null;const detail=err.name==='AbortError'?'A assistente demorou para responder.':err.message;status(detail);const notice=document.createElement('p');notice.className='live-request-error';notice.textContent=detail+' Não foi possível confirmar o retorno. ';const retry=document.createElement('button');retry.type='button';retry.className='live-retry';retry.textContent='Tentar novamente';retry.addEventListener('click',()=>{if(busy[seg])return;notice.remove();request(seg,message,extra);});notice.append(retry);box.append(notice);return null;}
  finally{clearTimeout(timer);indicator.remove();if(controllers[seg]===controller){busy[seg]=false;box.setAttribute('aria-busy','false');delete controllers[seg];}}
 }
 const live={enabled:true,async send(seg,raw,extra={}){const text=String(raw||'').trim().slice(0,800);if(!text||busy[seg])return;let message=text;
  if(text.startsWith('property:')){const id=Number(text.split(':')[1]),p=realtyInventory.find(x=>x.id===id);if(!p)return;message=`Tenho interesse no imóvel ${id}: ${p.title}`;}
  if(text.startsWith('slot:'))message='Quero esse horário de visita: '+text.slice(5).replace('|',' às ');
  add(seg,message,'user');const input=el(seg==='clinica'?'clinicInput':seg==='imobiliaria'?'leadInput':'salonInput');if(input)input.value='';if(seg==='clinica')clinic.messages++;
  return request(seg,message,extra);
 },action(seg,action,duration){return request(seg,'Ação da equipe no painel demonstrativo.',{action,duration});},reset(seg){revisions[seg]=(revisions[seg]||0)+1;controllers[seg]?.abort();delete controllers[seg];busy[seg]=false;delete ids[seg];delete states[seg];},states};
 window.ZionDemoLive=live;
 const localClinic=processClinic,localLead=processLead;
 processClinic=text=>live.enabled?live.send('clinica',text):localClinic(text);processLead=text=>live.enabled?live.send('imobiliaria',text):localLead(text);
 const oldResetClinic=resetClinic,oldResetLead=resetLead;
 resetClinic=opts=>{live.reset('clinica');oldResetClinic(opts);if(live.enabled){clinicChat.replaceChildren();clinicAddMsg('Olá! Bem-vindo à Clínica Horizonte Estético. Sou a Iana, assistente virtual da clínica. Como posso ajudar você hoje?');el('ctxCustomer').textContent='Visitante';el('clinicConfidence').textContent='IA real';el('clinicConfidence').previousElementSibling.textContent='ATENDIMENTO';}};
 resetLead=()=>{live.reset('imobiliaria');oldResetLead();if(live.enabled){leadChat.replaceChildren();realtyMsg('Olá! Sou a Iana, assistente virtual da Horizonte Prime Imóveis. Você está procurando um imóvel para comprar ou alugar?');}};
 // Scenario buttons now start a normal conversation, not a hidden successful booking.
 document.querySelectorAll('[data-clinic-scenario]').forEach(button=>{const clone=button.cloneNode(true);button.replaceWith(clone);clone.addEventListener('click',()=>{const s=clone.dataset.clinicScenario;resetClinic({silent:true});if(s!=='free')live.send('clinica',({booking:'Quero agendar uma avaliação',reschedule:'Quero reagendar meu horário',cancel:'Quero cancelar um horário',sessions:'Quantas sessões tenho no meu pacote?'})[s],{scenario:s});});});
 const auto=el('autoDemoBtn'),autoClone=auto.cloneNode(true);auto.replaceWith(autoClone);
 autoClone.textContent='▶ Ver uma conversa de exemplo';autoClone.addEventListener('click',async()=>{const seg=current();if(seg==='reposicao'){await autoStock();return;}if(busy[seg])return;autoClone.disabled=true;try{for(const message of ({salao:['Oi! Quanto custa o corte?','Paguei 450 numa geladeira, ainda estou pensando no corte.','Qual horário de atendimento?'],clinica:['Oi, queria entender a avaliação estética','Quanto custa?','Posso tirar uma dúvida antes de agendar?'],imobiliaria:['Oi, procuro casa para alugar em Costa e Silva, 3 quartos e até 3000 reais','Quero mudar em até 30 dias','O condomínio está incluído?']})[seg]){const result=await live.send(seg,message);if(!result)break;await new Promise(r=>setTimeout(r,1500));}}finally{autoClone.disabled=false;}});
 document.querySelectorAll('[data-auto]').forEach(b=>{b.hidden=true;});
 document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>live.reset(b.dataset.reset)));
 const resume=el('liveResume');resume.addEventListener('click',()=>{const seg=current();if(seg!=='reposicao')live.action(seg,'resume');});
 resetClinic({silent:true});resetLead();status('IA real disponível · escreva sua mensagem');
})();
