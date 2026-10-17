const clock=require('./clock.cjs');
const fs=require('fs'),path=require('path'),assert=require('assert');process.chdir(path.resolve(__dirname,'..'));
const sources=['imobiliaria-guard.js','service-guard.js'].filter(f=>fs.existsSync('server-demo/'+f)).map(f=>fs.readFileSync('server-demo/'+f,'utf8')).join('\n')+'\n'+fs.readFileSync('server-demo/saida.js','utf8');const execute=new Function('$input','$getWorkflowStaticData','$',sources);
function reply(seg,message,previous={},model={},history=[]){const ctx={segment:seg,message,previous:structuredClone(previous),session:{history:structuredClone(history),count:1},headers:{}};const result=execute({first:()=>({json:{choices:[{message:{content:JSON.stringify({reply:'Resposta sugerida pela IA.',state:{human:false,service:null,expected:null,appointment:null,payment:null,lead:{},...model.state},...model})}}]}})},()=>({}),()=>({first:()=>({json:ctx})}))[0].json;return result.result;}
const results=[];function check(name,fn){try{fn();results.push({name,passed:true})}catch(e){results.push({name,passed:false,error:e.message})}}
const base={matchRulesVersion:2,lead:{purpose:'Aluguel',type:'Apartamento',region:'Costa e Silva'},awaiting:'bedrooms'};
for(const v of ['3','três','tres','3.'])check('imob_short_bedrooms_'+v,()=>assert.equal(reply('imobiliaria',v,base).state.lead.bedrooms,3));
check('imob_old_session_question_recovers_bare_number',()=>assert.equal(reply('imobiliaria','3',{...base,awaiting:null},{},[{role:'assistant',content:'Quantos quartos você precisa?'}]).state.lead.bedrooms,3));
for(const v of ['3000','3 mil','3.000,00'])check('imob_short_budget_'+v,()=>assert.equal(reply('imobiliaria',v,{...base,lead:{...base.lead,bedrooms:3},awaiting:'budget'}).state.lead.budgetMax,3000));
check('imob_number_without_context_not_bedroom_or_budget',()=>{const s=reply('imobiliaria','3').state;assert(!s.lead.bedrooms);assert(!s.lead.budgetMax);});
check('imob_bedroom_number_does_not_set_budget',()=>assert(!reply('imobiliaria','3',base).state.lead.budgetMax));
const matched={...base,lead:{...base.lead,bedrooms:2,budgetMax:3000,budget:'R$ 3.000,00'},propertyMatches:[3],awaiting:'property_choice'};
check('imob_number_one_selects_first_displayed_property_not_id_one',()=>assert.equal(reply('imobiliaria','1',matched).state.selectedProperty,3));
check('imob_words_first_select_displayed_property',()=>assert.equal(reply('imobiliaria','a primeira opção',matched).state.selectedProperty,3));
check('imob_negative_does_not_create_visit',()=>assert(!reply('imobiliaria','Não quero visitar',{...matched,selectedProperty:3,awaiting:'offer_visit'}).state.visit));
for(const seg of ['salao','clinica']){
 const service=seg==='salao'?'Corte':'Avaliação estética',expected=seg==='salao'?8000:22000;
 check(seg+'_price_has_authoritative_value',()=>{const r=reply(seg,'Quanto custa '+service+'?',{},{reply:'Custa R$0,80.',state:{service,expected:80}});assert.equal(r.state.expected,expected);assert(!r.reply.includes('0,80'));});
 check(seg+'_price_question_never_creates_appointment',()=>assert(!reply(seg,'Quanto custa '+service+'?',{},{state:{service,appointment:{status:'confirmed',date:'amanhã',time:'14:00'}}}).state.appointment));
 check(seg+'_bare_yes_does_not_create_appointment',()=>assert(!reply(seg,'sim',{service,expected},{state:{service,appointment:{status:'confirmed',date:'amanhã',time:'14:00'}}}).state.appointment));
 check(seg+'_unrelated_purchase_not_payment',()=>assert(!reply(seg,'Paguei 450 na geladeira',{service,expected},{state:{service,payment:{status:'declared',amount:45000}}}).state.payment));
 check(seg+'_future_payment_not_receipt',()=>assert(!reply(seg,'Vou pagar 80 amanhã',{service,expected},{state:{service,payment:{status:'received',amount:8000}}}).state.payment));
 check(seg+'_negative_payment_clears_unverified_declaration',()=>assert(!reply(seg,'Não paguei, me enganei',{service,payment:{status:'declared',amount:8000}},{state:{service,payment:{status:'declared',amount:8000}}}).state.payment));
 check(seg+'_old_payment_declaration_survives_unrelated_question',()=>assert.equal(reply(seg,'Qual endereço?',{service,payment:{status:'declared',amount:expected}},{state:{service,payment:null}}).state.payment?.amount,expected));
 check(seg+'_confirmed_owner_receipt_not_overwritten',()=>assert.equal(reply(seg,'Quanto custa?',{service,payment:{status:'received',amount:expected}},{state:{service,payment:null}}).state.payment.status,'received'));
 check(seg+'_cancel_keeps_confirmed_slot_pending_confirmation',()=>{const s=reply(seg,'Quero cancelar',{service,appointment:{status:'confirmed',date:'amanhã',time:'14:00'}},{state:{service,appointment:null}}).state;assert(s.appointment);assert(['cancel_requested','confirmed'].includes(s.appointment.status));});
 check(seg+'_handoff_after_offer_and_yes',()=>assert(reply(seg,'Sim',{awaiting:'handoff_offer'}).state.human));
 check(seg+'_negative_handoff_does_not_pause',()=>assert(!reply(seg,'Não quero falar com uma pessoa').state.human));
}

function chain(seg,initial={}){let state=structuredClone(initial),history=[];return message=>{const r=reply(seg,message,state,{},history);state=structuredClone(r.state);history.push({role:'user',content:message},{role:'assistant',content:r.reply});return r;};}
for(const seg of ['clinica','salao']){
 const label=seg==='clinica'?'avaliação estética':'corte';
 check(seg+'_collect_day_then_hour_in_separate_messages',()=>{const t=chain(seg);let r=t('Quero agendar '+label);assert.equal(r.state.awaiting,'booking_date');r=t('Amanhã');assert.equal(r.state.awaiting,'booking_time');r=t('14');assert.equal(r.state.booking.time,'14:00');assert.equal(r.state.appointment.status,'requested');});
 check(seg+'_yes_without_time_never_chooses_hour',()=>{const t=chain(seg);t('Quero agendar '+label);t('Amanhã');const r=t('Sim');assert(!r.state.booking.time);assert.equal(r.state.awaiting,'booking_time');});
 check(seg+'_question_does_not_erase_booking_context',()=>{const t=chain(seg);t('Quero agendar '+label);t('Amanhã');const r=t('Aceita Pix?');assert.equal(r.state.awaiting,'booking_time');assert(r.state.booking.date);assert.equal(t('14').state.booking.time,'14:00');});
 check(seg+'_invalid_date_rejected',()=>{const t=chain(seg);const r=t('Quero agendar '+label+' dia 31/02 às 14h');assert(!r.state.appointment);assert.equal(r.state.awaiting,'booking_date');});
 check(seg+'_past_date_rejected',()=>{const t=chain(seg);const r=t('Quero agendar '+label+' dia 01/01/2020 às 14h');assert(!r.state.appointment);assert.equal(r.state.awaiting,'booking_date');});
 check(seg+'_sunday_rejected',()=>{const t=chain(seg);const r=t('Quero agendar '+label+' no domingo às 14h');assert(!r.state.appointment);assert.equal(r.state.awaiting,'booking_date');});
 check(seg+'_closed_hour_rejected',()=>{const t=chain(seg);const r=t('Quero agendar '+label+' amanhã às 23h');assert(!r.state.appointment);assert.equal(r.state.awaiting,'booking_time');});
 check(seg+'_payment_asks_amount_and_accepts_bare_amount',()=>{const t=chain(seg,{service:seg==='clinica'?'Avaliação estética':'Corte'});let r=t('Fiz o Pix pelo serviço');assert.equal(r.state.awaiting,'payment_amount');r=t('80');assert.equal(r.state.payment.amount,8000);assert.equal(r.state.payment.status,'declared');});
 check(seg+'_payment_question_preserves_missing_amount',()=>{const t=chain(seg,{service:seg==='clinica'?'Avaliação estética':'Corte'});t('Fiz o Pix pelo serviço');let r=t('Qual endereço?');assert(r.reply.includes('Rua Exemplo'));r=t('80');assert.equal(r.state.payment.amount,8000);});
 check(seg+'_thousand_payment_parsed_as_reais',()=>assert.equal(reply(seg,'Paguei R$ 1.200,50 pelo serviço',{service:seg==='clinica'?'Avaliação estética':'Corte'}).state.payment.amount,120050));
 check(seg+'_two_installments_not_guessed_as_total',()=>assert(!reply(seg,'Paguei 2 parcelas de 80',{service:seg==='clinica'?'Avaliação estética':'Corte'}).state.payment));
 check(seg+'_price_question_during_confirmation_keeps_explicit_confirmation',()=>{const t=chain(seg);t('Quero agendar '+label+' amanhã às 14h');const r=t('Qual valor mesmo?');assert(r.state.booking.date);assert.equal(r.state.appointment.status,'requested');assert(!/agendamento.*confirmado/.test(r.reply));});
}
check('clinic_confirmation_needs_exact_yes',()=>{const t=chain('clinica');t('Quero agendar avaliação amanhã às 14h');const r=t('Sim, mas ainda não quero confirmar');assert.equal(r.state.appointment.status,'requested');});
check('clinic_confirmation_after_price_question',()=>{const t=chain('clinica');t('Quero agendar avaliação amanhã às 14h');t('Qual valor mesmo?');const r=t('Sim, pode confirmar');assert.equal(r.state.appointment.status,'confirmed');});
check('clinic_cancel_confirmation_then_no_keeps_booking',()=>{const t=chain('clinica');t('Quero agendar avaliação amanhã às 14h');t('Sim');t('Quero cancelar');assert.equal(t('Não').state.appointment.status,'confirmed');});
check('clinic_cancel_confirmation_then_yes_clears_booking',()=>{const t=chain('clinica');t('Quero agendar avaliação amanhã às 14h');t('Sim');t('Quero cancelar');assert.equal(t('Sim').state.appointment,null);});
check('clinic_reschedule_keeps_original_until_new_confirmation',()=>{const t=chain('clinica');t('Quero agendar avaliação amanhã às 14h');const before=t('Sim').state.appointment;t('Quero remarcar para depois de amanhã às 11h');const r=t('Qual o valor?');assert.deepEqual(r.state.appointment,before);assert.equal(t('Sim').state.appointment.time,'11:00');});
check('clinic_botox_booking_routes_to_evaluation',()=>{const r=chain('clinica')('Quero agendar botox amanhã às 14h');assert.equal(r.state.service,'Avaliação estética');assert.equal(r.state.expected,22000);});
check('salon_mechas_does_not_invent_price_or_slot',()=>{const r=chain('salao')('Quero agendar mechas amanhã às 14h');assert(!r.state.appointment);assert.equal(r.state.expected,null);assert.equal(r.state.awaiting,'handoff_offer');});
check('imob_cancel_confirmed_visit_requires_confirmation',()=>{const initial={...matched,selectedProperty:3,visit:{status:'confirmed',date:'2030-01-01',time:'10:00'},awaiting:null};const t=chain('imobiliaria',initial);let r=t('Quero cancelar a visita');assert.equal(r.state.awaiting,'visit_cancel_confirmation');assert(r.state.visit);r=t('Sim');assert(!r.state.visit);});
check('imob_bare_hour_after_day_choice',()=>{const t=chain('imobiliaria',matched);t('Sim');t('Quero visitar');t('Amanhã');assert.equal(t('10').state.visit.time,'10:00');});
check('imob_first_available_hour_by_number',()=>{const t=chain('imobiliaria',matched);t('Sim');t('Quero visitar');t('Amanhã');assert.equal(t('1').state.visit.time,'10:00');});
check('imob_FAQ_during_visit_preserves_day',()=>{const t=chain('imobiliaria',matched);t('Sim');t('Quero visitar');t('Amanhã');let r=t('Qual o condomínio?');assert.equal(r.state.awaiting,'visit_time');assert(r.reply.includes('não está cadastrada'));assert.equal(t('10').state.visit.time,'10:00');});
check('imob_yes_after_FAQ_cannot_confirm_visit_implicitly',()=>{const t=chain('imobiliaria',matched);t('Sim');t('Quero visitar amanhã às 10h');t('Qual o condomínio?');let r=t('Sim');assert.equal(r.state.visit.status,'requested');assert.equal(r.state.awaiting,'visit_confirmation');assert.equal(t('Sim').state.visit.status,'confirmed');});
check('imob_FAQ_while_collecting_bedrooms_does_not_lose_pending_number',()=>{const t=chain('imobiliaria',base);t('Qual o condomínio?');assert.equal(t('3').state.lead.bedrooms,3);});
for(const seg of ['salao','clinica'])check(seg+'_explicit_refusal_to_book_does_not_start_booking',()=>{const r=reply(seg,'Não quero agendar agora',{service:seg==='salao'?'Corte':'Avaliação estética'},{reply:'Vamos marcar!',state:{appointment:{status:'requested',date:'amanhã',time:'14:00'}}});assert(!r.state.booking);assert(!r.state.appointment);});
check('imob_tiny_bare_budget_requires_unit_clarification',()=>{const r=reply('imobiliaria','3',{...base,lead:{...base.lead,bedrooms:3},awaiting:'budget'});assert(!r.state.lead.budgetMax);assert.equal(r.state.awaiting,'budget');});
check('salon_no_after_request_withdraws_unconfirmed_request',()=>{const t=chain('salao');t('Quero marcar corte amanhã às 14h');const r=t('Não');assert(!r.state.appointment);assert(!r.state.booking);});
check('tomorrow_sunday_rejected_for_both_service_segments',()=>{clock.setNow('2026-10-17T15:00:00Z');try{for(const seg of ['clinica','salao']){const r=chain(seg)('Quero agendar '+(seg==='clinica'?'avaliação estética':'corte')+' amanhã às 14h');assert(!r.state.appointment);assert.equal(r.state.awaiting,'booking_date');}}finally{clock.setNow('2026-10-14T15:00:00Z');}});
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results}));if(results.some(r=>!r.passed))process.exitCode=1;
