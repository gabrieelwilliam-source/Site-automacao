/* Authoritative fictional inventory, matching and visit choices. AI cannot relax criteria. */
function guardRealty(ctx,out){
 const s=out.state,prior=ctx.previous||{},normalize=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),text=normalize(ctx.message),money=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const inventory=[{id:1,type:'Casa',region:'Costa e Silva',bedrooms:3,rent:2850,title:'Casa contemporânea'},{id:2,type:'Casa',region:'América',bedrooms:3,rent:3200,title:'Sobrado geminado'},{id:3,type:'Apartamento',region:'Costa e Silva',bedrooms:2,rent:2650,title:'Apartamento Garden'},{id:4,type:'Apartamento',region:'Centro',bedrooms:2,rent:2300,title:'Apartamento'}];
 const details={1:{area:118,parking:2,description:'casa contemporânea no Costa e Silva'},2:{area:105,suite:true,description:'sobrado geminado no América'},3:{parking:1,garden:true,description:'apartamento garden no Costa e Silva'},4:{area:74,parking:1,description:'apartamento no Centro'}};
 const selectionId=text.match(/(?:imovel|id)\s*(\d+)\b/),propertyQuestion=!!prior.selectedProperty&&/duvida|\?|quanto|quantos|qual |tem |possui|aceita|metragem|vagas|suite|financia|condominio/.test(text);
 s.showProperties=false;
 const salePrices={1:680000,2:720000,3:480000,4:420000};
 const purposeOf=msg=>/comprar|\bcompra\b|\bvenda\b|\bbuy\b|\bsale\b/.test(msg)?'Compra':/alugar|aluguel|locacao|\blocar\b|\brent\b/.test(msg)?'Aluguel':null;
 const lastQuestion=normalize([...(ctx.session?.history||[])].reverse().find(m=>m.role==='assistant')?.content);
 const pending=prior.awaiting||(/quantos quartos/.test(lastQuestion)?'bedrooms':/valor maximo|orcamento mensal/.test(lastQuestion)?'budget':null);
 const wordNumbers={um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9};
 const profile={...(prior.matchRulesVersion===2?prior.lead||{}:{})};let changed=false,budgetNeedsUnit=false,purposeChanged=false;
 const set=(key,value)=>{if(value!==undefined&&value!==null&&profile[key]!==value){profile[key]=value;changed=true;}};
 const inputs=prior.matchRulesVersion===2?[ctx.message]:[...(ctx.session?.history||[]).filter(m=>m.role==='user').map(m=>m.content),ctx.message];
 for(const input of inputs){const raw=normalize(input);const text=propertyQuestion?'':selectionId?raw.split(':')[0]:raw;
 const positive=text.replace(/nao (?:quero |e para )?(?:comprar|alugar|compra|aluguel)/g,'');
 const purpose=purposeOf(positive);if(purpose){if(profile.purpose&&profile.purpose!==purpose){delete profile.budget;delete profile.budgetMax;purposeChanged=true;}set('purpose',purpose);}
 if(/apartamento|\bapto\b/.test(positive))set('type','Apartamento');else if(/\bcasa|sobrado/.test(positive))set('type','Casa');else if(/terreno/.test(positive))set('type','Terreno');
 const region=/costa e silva/.test(text)?'Costa e Silva':/\bamerica\b/.test(text)?'América':/\bcentro\b/.test(text)?'Centro':null;if(region)set('region',region);
 else {const r=text.match(/(?:no bairro|na regiao de|no bairro de|bairro)\s+([a-z ]{3,40}?)(?:[,.;!?]|$)/);if(r)set('region',r[1].trim());}
 if(/qualquer bairro|sem preferencia de bairro/.test(text))set('region','Sem preferência');
 const numericText=text.replace(/\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove)\b/g,w=>wordNumbers[w]);
 const shortBed=pending==='bedrooms'&&/^\s*[1-9][.! ]*$/.test(numericText)?Number(numericText.match(/[1-9]/)[0]):null;if(shortBed)set('bedrooms',shortBed);
 const bed=numericText.match(/\b([1-9])\s*(?:quartos?|dormitorios?)/);if(bed&&!/nao (?:quero|aceito)\s*\d\s*(?:quartos|dormitorios)/.test(text))set('bedrooms',+bed[1]);
 // Budget requires a monetary cue. Never use bedrooms or visit hours as money.
 const budgetInput=text.replace(/\b(um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove)\b/g,w=>wordNumbers[w]);
 const budgetText=pending==='budget'&&/^\s*\d+(?:[.,]\d+)*(?:\s*mil)?[.! ]*$/.test(budgetInput)?'ate '+budgetInput:budgetInput;
 const budget=budgetText.match(/(?:ate|orcamento(?: de| e|:)?|teto(?: de| e|:)?|r\$)\s*(?:r\$\s*)?(\d+(?:[.,]\d+)*)(?:\s*(mil|milhao|milhoes))?/);
 if(budget){let value=budget[1].replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');value=+value*(budget[2]==='mil'?1000:/milhao|milhoes/.test(budget[2]||'')?1000000:1);if(Number.isFinite(value)&&value>0){if(pending==='budget'&&value<100&&!/r\$|reais|mil/.test(text)){budgetNeedsUnit=true;}else{set('budgetMax',value);set('budget',money(value));}}}
 if(/dias|meses|quanto antes|pesquisando/.test(text)&&s.lead?.timeline)set('timeline',String(s.lead.timeline).slice(0,80));
 }
 s.matchRulesVersion=2;
 // Existing sessions may have model-inferred fields; an unverified old budget is not authoritative.
 if(!profile.budgetMax&&profile.budget){const raw=normalize(profile.budget),m=raw.match(/\d+(?:[.,]\d+)*/);if(m){let v=+m[0].replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');if(/mil/.test(raw)&&v<1000)v*=1000;if(v>0)profile.budgetMax=v;}}
 s.lead=profile;s.service=null;s.expected=null;s.payment=null;s.appointment=null;
 const purchase=profile.purpose==='Compra',priceFor=p=>purchase?salePrices[p.id]:p.rent,priceLabel=p=>money(priceFor(p))+(purchase?'':'/mês');
 const browseRequested=/^(?:quero |pode |gostaria de )?(?:ver|conhecer|mostrar|listar).*(?:imoveis|imovel|opcoes|carteira)|quais.*(?:imoveis|opcoes)|catalogo/.test(text);
 const catalogMode=browseRequested||prior.propertyCatalog===true;s.propertyCatalog=catalogMode;s.catalogPurpose=purchase?'Compra':'Aluguel';
 const complete=profile.purpose&&profile.type&&profile.region&&profile.bedrooms&&profile.budgetMax;
 const matches=(catalogMode||selectionId||prior.selectedProperty)?inventory.filter(p=>(!profile.type||p.type===profile.type)&&(!profile.region||profile.region==='Sem preferência'||normalize(p.region)===normalize(profile.region))&&(!profile.bedrooms||p.bedrooms>=profile.bedrooms)&&(!profile.budgetMax||priceFor(p)<=profile.budgetMax)):complete?inventory.filter(p=>p.type===profile.type&&(profile.region==='Sem preferência'||normalize(p.region)===normalize(profile.region))&&p.bedrooms>=profile.bedrooms&&priceFor(p)<=profile.budgetMax):[];
 s.propertyMatches=matches.map(p=>p.id);s.selectedProperty=!purposeChanged&&matches.some(p=>p.id===prior.selectedProperty)?prior.selectedProperty:null;s.visit=s.selectedProperty?prior.visit||null:null;s.awaiting=prior.awaiting||null;
 if(changed){s.visit=null;s.awaiting=null;}
 const answer=(reply,reason)=>{out.reply=reply;out.reason=reason;s.intent=reason;return out;};
 if(s.human)return answer('Vou passar a conversa para a equipe, com suas preferências registradas para você não precisar repetir.','Atendimento humano solicitado');
 const greeting=/^(bom dia|boa tarde|boa noite|oi|ola)[!., ]*$/.test(text);
 if(greeting&&!Object.keys(profile).length)return out;
 // Social replies acknowledge the current stage; never re-run listing presentation.
 const receipt=/^(?:(?:ok|okay|certo|entendi|beleza|perfeito|combinado|ta bom|tudo bem|obrigad[oa](?: mesmo)?|valeu|no aguardo|fico no aguardo|estou aguardando|aguardando|vou (?:ver|olhar|pensar|analisar))(?:[\s,!.;]+|$))+$/;
 if(!changed&&(receipt.test(text.trim())||greeting)){
  s.awaiting=prior.awaiting||null;
  if(prior.awaiting==='visit_confirmation'||prior.awaiting==='visit_cancel_confirmation')return answer(prior.awaiting==='visit_cancel_confirmation'?'Tudo bem. O cancelamento ainda depende da sua confirmação. Você quer cancelar a visita?':'Tudo bem. O horário ainda depende da sua confirmação. Você confirma a visita no dia e horário apresentados?','Resposta social não confirma nem cancela visita');
  if(prior.visit?.status==='confirmed')return answer('Por nada. Sua visita de demonstração continua confirmada. Se precisar de algum ajuste, é só me chamar.','Continuidade após confirmação; visita preservada');
  if(prior.awaiting==='visit_date'||prior.awaiting==='visit_time')return answer(prior.awaiting==='visit_date'?'Claro. Quando decidir, me diga o dia que prefere para a visita.':'Claro. Quando decidir, me diga qual dos horários apresentados funciona melhor.','Preferências e etapa da visita preservadas');
  if(['type','region','bedrooms','budget','purpose'].includes(prior.awaiting))return answer('Sem pressa. Quando quiser, podemos continuar de onde paramos.','Preferências preservadas; sem relistar carteira');
  if(prior.selectedProperty)return answer('Estou por aqui. Se surgir outra dúvida sobre esse imóvel, é só me chamar.','Continuidade natural; imóvel e etapa preservados');
  return answer('Claro, fique à vontade para olhar. Quando quiser, me diga qual imóvel chamou sua atenção ou qual dúvida posso esclarecer.','Reconhecimento contextual; sem repetir carteira nem presumir escolha');
 }

 if(browseRequested&&catalogMode&&!/(?:imovel|id)\s*\d/.test(text)){if(prior.visit?.status!=='confirmed'){s.selectedProperty=null;s.visit=null;}s.showProperties=true;s.awaiting='property_choice';return answer(matches.length?'Separei estas opções de '+(purchase?'compra':'aluguel')+':\n\n'+matches.map((p,i)=>`${i+1}. ${p.title} · ${p.region} · ${p.bedrooms} quartos · ${priceLabel(p)} (ID ${p.id})`).join('\n')+'\n\nVocê pode abrir as fotos e escolher um imóvel abaixo. Qual chamou sua atenção?':'Não há imóveis nessa carteira para os critérios informados. Posso procurar com outro bairro ou tipo, se você quiser.','Carteira demonstrativa consultada; sem presumir orçamento ou criar visita');}
 const yes=/^(sim|pode ser|quero sim|confirmo|pode confirmar|confirmar)(?:[!., ]|$)/.test(text)&&!/nao|talvez|pensar|cancel/.test(text);
 const requestedId=text.match(/(?:imovel|id)\s*(\d+)\b/);let chosen=requestedId?matches.find(p=>p.id===+requestedId[1]):null;
 const option=text.match(/opcao\s*(\d+)|^(\d+)[.! ]*$/);const ordinal=/primeir/.test(text)?1:/segund/.test(text)?2:/terceir/.test(text)?3:null;
 if(!chosen&&pending==='property_choice'&&(option||ordinal))chosen=matches[(ordinal||Number(option[1]||option[2]))-1];
 if(!chosen&&/garden/.test(text))chosen=matches.find(p=>p.id===3);
 if(!chosen&&yes&&prior.awaiting==='property_choice'&&matches.length===1)chosen=matches[0];
 if(chosen)s.selectedProperty=chosen.id;
 if(requestedId&&!chosen)return answer('Esse imóvel não atende aos critérios atuais. Para continuar com ele, precisamos primeiro rever suas preferências. Quer manter os critérios ou ajustar algum deles?','Imóvel escolhido incompatível com os critérios');
 const selected=inventory.find(p=>p.id===s.selectedProperty),wantsVisit=/visita|visitar|ver horarios|conhecer (?:esse|este|o) imovel/.test(text);
 const chosenDetails=selected?details[selected.id]:null;
 s.focusedProperty=selected?{id:selected.id,title:selected.title,type:selected.type,region:selected.region,bedrooms:selected.bedrooms,...chosenDetails,purpose:purchase?'Compra':'Aluguel',price:priceFor(selected)}:null;
 if(selected&&/^(?:tenho |estou com |mais )?(?:uma |outra )?duvida(?: sobre.*)?[.! ]*$/.test(text)){s.awaiting=prior.awaiting||'property_question';return answer('Claro. O que você gostaria de saber sobre esse imóvel?','Dúvida priorizada; sem relistar imóveis ou oferecer visita');}
 if(/condominio|financiamento|financiar|documentos|iptu|taxas|pet|animais|endereco|negociavel|desconto|aceita.*(?:mil|r\$)|elevador|andar|mobiliado/.test(text)){
  const preservePending=['purpose','type','region','bedrooms','budget','visit_date','visit_time'].includes(pending);
  s.resumeAwaiting=pending||'property_question';s.awaiting=pending==='visit_confirmation'?'visit_confirmation_interrupted':preservePending?pending:'handoff_offer';
  return answer('Essa informação não está cadastrada na ficha'+(selected?' desse imóvel':'')+'. Prefiro confirmar com o corretor para te passar a informação certa.'+(pending==='visit_confirmation'?' O horário continua aguardando sua confirmação.':preservePending?' Podemos continuar de onde paramos.':' Você quer que eu encaminhe essa dúvida?'),'Informação ausente; sem inventar condições, endereço ou custos');
 }
 if(selected&&propertyQuestion){
  const facts=[];
  if(/quartos|dormitorios/.test(text))facts.push('Ele tem '+selected.bedrooms+' quartos.');
  if(/metragem|quantos metros|area|tamanho/.test(text))facts.push(chosenDetails.area?'A área informada é de '+chosenDetails.area+' m².':'A metragem não está informada nessa ficha. Posso pedir ao corretor para confirmar.');
  if(/vaga|garagem/.test(text))facts.push(chosenDetails.parking?'A ficha informa '+chosenDetails.parking+(chosenDetails.parking===1?' vaga de garagem.':' vagas de garagem.'):'A quantidade de vagas não está informada na ficha. Posso confirmar com o corretor.');
  if(/suite/.test(text))facts.push(chosenDetails.suite?'Sim, a ficha informa uma suíte.':'A ficha não informa se há suíte. Posso confirmar esse detalhe com o corretor.');
  if(/garden|quintal/.test(text))facts.push(chosenDetails.garden?'Sim, é um apartamento garden. As medidas da área externa precisam ser confirmadas com o corretor.':'Esse detalhe não está informado na ficha. Posso confirmar com o corretor.');
  if(/bairro|regiao|localizacao/.test(text))facts.push('Ele fica no bairro '+selected.region+', em Joinville.');
  if(/preco|valor|custa|quanto (?:e|esta|fica)/.test(text))facts.push('O '+(purchase?'valor de compra':'aluguel mensal')+' é '+priceLabel(selected)+'.');
  const fact=facts.join(' ');
  if(fact){s.awaiting=pending==='visit_confirmation'?'visit_confirmation_interrupted':pending||'property_question';return answer(fact,'Pergunta respondida com dados da ficha; contexto preservado');}
 }
 if(!selected&&!profile.purpose&&!catalogMode){s.awaiting='purpose';return answer('Você procura esse imóvel para comprar ou para alugar?','Objetivo da busca ainda não informado');}
 if(!selected&&!profile.type&&!catalogMode){s.awaiting='type';return answer('Você prefere apartamento, casa ou terreno?','Tipo de imóvel ainda não informado');}
 if(!selected&&!profile.region&&!catalogMode){s.awaiting='region';return answer('Em qual bairro você quer procurar?','Bairro ainda não informado');}
 if(!selected&&!profile.bedrooms&&!catalogMode){s.awaiting='bedrooms';return answer('Quantos quartos você precisa?','Quantidade de quartos ainda não informada');}
 if(budgetNeedsUnit){s.awaiting='budget';return answer('Para não confundir o valor: você pode informar o orçamento com a unidade? Por exemplo, 3 mil ou R$ 3.000.','Orçamento curto sem unidade; valor não presumido');}
 if(!selected&&!profile.budgetMax&&!catalogMode){s.awaiting='budget';return answer(purchase?'Qual é o valor máximo que você pretende investir na compra?':'Qual é o valor máximo de aluguel por mês que você procura?','Orçamento mensal ainda não informado');}
 if(!matches.length){s.selectedProperty=null;s.visit=null;s.awaiting='criteria';return answer(`Não encontrei ${(profile.type||'imóveis').toLowerCase()} com pelo menos ${profile.bedrooms} quartos em ${profile.region} até ${money(profile.budgetMax)}${purchase?'':'/mês'} nesta carteira. Vou manter seus critérios. Você prefere procurar outro bairro ou rever o tipo de imóvel?`,'Nenhum imóvel atende a todos os critérios; nenhuma visita criada');}
 if(prior.awaiting==='handoff_offer'&&/^(nao|agora nao)[.! ]*$/.test(text)){s.awaiting=prior.resumeAwaiting||'property_question';return answer('Tudo bem, podemos continuar por aqui. O que mais você gostaria de saber?','Encaminhamento recusado; contexto preservado');}
 if(selected&&propertyQuestion&&!wantsVisit){s.awaiting=pending==='visit_confirmation'?'visit_confirmation_interrupted':pending||'property_question';return out;}
 if(prior.awaiting==='visit_cancel_confirmation'){
  if(yes){s.visit=null;s.awaiting=null;return answer('A visita de demonstração foi cancelada. Quer continuar procurando imóveis?','Cancelamento confirmado pela pessoa');}
  if(/^(nao|deixa como esta|manter)[.! ]*$/.test(text)){s.visit=prior.visit;s.awaiting=null;return answer('Tudo bem, mantive a visita como estava.','Cancelamento recusado; visita preservada');}
 }
 if(/cancelar|desmarcar|nao quero visitar/.test(text)&&!/nao quero cancelar|nao cancele/.test(text)){
  if(s.visit){s.awaiting='visit_cancel_confirmation';return answer('Você quer cancelar a visita que estava marcada?','Cancelamento precisa de confirmação');}
  s.awaiting=null;return answer('Tudo bem. Nenhuma visita foi marcada. Quer manter a busca pelos imóveis?','Recusa de visita respeitada');
 }

 const tomorrow=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=Object.fromEntries(parts.map(x=>[x.type,x.value]));return new Date(Date.UTC(+v.year,+v.month-1,+v.day,12));};
 const dateKey=offset=>{const d=tomorrow();d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);},pretty=d=>String(d).replace(/^(\d{4})-(\d{2})-(\d{2})$/,'$3/$2/$1');
 const slots=[{date:dateKey(1),time:'10:00'},{date:dateKey(1),time:'15:30'},{date:dateKey(2),time:'09:00'}];
 let date=/depois de amanha/.test(text)?dateKey(2):/amanha/.test(text)?dateKey(1):null;
 const explicitDate=text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);if(explicitDate)date=`${explicitDate[3]||tomorrow().getUTCFullYear()}-${explicitDate[2].padStart(2,'0')}-${explicitDate[1].padStart(2,'0')}`;
 const tm=text.match(/\b([01]?\d|2[0-3])(?:h([0-5]\d)?|:([0-5]\d))\b|\bas\s+([01]?\d|2[0-3])\b/);let time=tm?String(tm[1]||tm[4]).padStart(2,'0')+':'+(tm[2]||tm[3]||'00'):null;
 if(!time&&pending==='visit_time'){const simple=text.match(/^([01]?\d|2[0-3])[.! ]*$/);const order=/primeir/.test(text)?1:/segund/.test(text)?2:null;if(order||(simple&&+simple[1]<=3)){const pick=slots.filter(x=>x.date===prior.visit?.date)[(order||+simple[1])-1];if(pick)time=pick.time;}else if(simple)time=simple[1].padStart(2,'0')+':00';}
 if(yes&&prior.awaiting==='visit_confirmation_interrupted'&&selected&&s.visit?.date&&s.visit?.time){s.awaiting='visit_confirmation';return answer(`Antes de confirmar: visita a ${selected.title}, em ${pretty(s.visit.date)} às ${s.visit.time}. Você confirma esse horário?`,'Confirmação retomada após dúvida; ainda sem confirmar visita');}
 if(yes&&prior.awaiting==='visit_confirmation'&&s.visit?.status==='requested'&&!changed&&!date&&!time){s.visit={...s.visit,status:'confirmed'};s.awaiting=null;return answer(`Visita confirmada na demonstração: ${selected.title}, ${selected.region}, ${pretty(s.visit.date)} às ${s.visit.time}. Nenhuma reserva real foi criada.`,'Visita demonstrativa confirmada após escolha e aceite explícitos');}
 if(selected&&(wantsVisit||date||time||prior.awaiting==='visit_date'||prior.awaiting==='visit_time'||prior.awaiting==='visit_confirmation')){
  const day=date||(!changed?prior.visit?.date:null);
  if(!day){s.visit=null;s.awaiting='visit_date';return answer(`Para visitar ${selected.title}, qual dia você prefere? Tenho opções em ${pretty(slots[0].date)} e ${pretty(slots[2].date)}.`,'Aguardando escolha do dia; nenhum horário presumido');}
  const options=slots.filter(x=>x.date===day);if(!options.length){s.visit=null;s.awaiting='visit_date';return answer(`Não tenho horários de demonstração nessa data. Você prefere ${pretty(slots[0].date)} ou ${pretty(slots[2].date)}?`,'Dia solicitado sem horários disponíveis');}
  if(!time){s.visit={status:'requested',date:day,time:null};s.awaiting='visit_time';return answer(`Em ${pretty(day)}, posso oferecer ${options.map(x=>x.time).join(' ou ')}. Qual horário funciona melhor para você?`,'Aguardando escolha do horário; nenhum horário presumido');}
  if(!options.some(x=>x.time===time)){s.visit={status:'requested',date:day,time:null};s.awaiting='visit_time';return answer(`Nesse dia não tenho ${time}. Os horários disponíveis são ${options.map(x=>x.time).join(' ou ')}. Qual você prefere?`,'Horário solicitado não disponível');}
  s.visit={status:'requested',date:day,time};s.awaiting='visit_confirmation';return answer(`Confira: visita a ${selected.title}, ${selected.region}, ${selected.bedrooms} quartos, ${purchase?'valor de compra':'aluguel'} de ${priceLabel(selected)}, em ${pretty(day)} às ${time}. Posso confirmar essa visita na demonstração?`,'Dia e horário escolhidos; aguardando confirmação explícita');
 }
 if(selected&&chosen){s.awaiting='property_question';return answer(`Esse ${chosenDetails.description} tem ${selected.bedrooms} quartos${chosenDetails.area?', '+chosenDetails.area+' m²':''}${chosenDetails.parking?' e '+chosenDetails.parking+(chosenDetails.parking===1?' vaga':' vagas'):''}. O ${purchase?'valor de compra':'aluguel mensal'} é ${priceLabel(selected)}. O que você gostaria de saber sobre ele?`,'Ficha do imóvel escolhido; espaço para dúvidas antes da visita');}
 if(selected&&yes&&prior.awaiting==='offer_visit'){s.awaiting='visit_date';return answer(`Qual dia você prefere para visitar? Tenho opções em ${pretty(slots[0].date)} e ${pretty(slots[2].date)}.`,'Interesse em visita; aguardando escolha do dia');}
 if(/condominio|financiamento|documentos|iptu|taxas|pet|animais/.test(text))return answer('Essa informação não está cadastrada nesta carteira de demonstração. Posso deixar a dúvida para um corretor conferir antes de você decidir.','Informação não cadastrada; sem inventar custos ou condições');
 if(selected){s.awaiting=prior.awaiting||'property_question';if(!out.reply)return out;return out;}
 s.showProperties=true;
 s.awaiting='property_choice';return answer(`Encontrei ${matches.length===1?'uma opção que atende':'estas opções que atendem'} aos seus critérios: ${matches.map(p=>`${p.title} (imóvel ${p.id}), ${p.region}, ${p.bedrooms} quartos, ${priceLabel(p)}`).join('; ')}. ${matches.length===1?'Quer conhecer melhor esse imóvel?':'Qual você quer conhecer melhor?'}`,'Imóveis filtrados por finalidade, tipo, bairro, quartos e orçamento');
}
