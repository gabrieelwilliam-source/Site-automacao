const ctx=$('Validar e preparar conversa').first().json,session=ctx.session;
const fail=()=>{const raw=$input.first().json,err=typeof raw.error==='string'?{message:raw.error}:raw.error||{},message=String(err.message||err.description||raw.message||''),limited=/rate|quota|limit|too many|tokens per/i.test(message),daily=/per day|daily|TPD|insufficient_quota/i.test(message);const result={ok:false,error:limited?(daily?'A cota diária de IA foi atingida. Tente mais tarde ou fale com a Zion.':'A IA atingiu um limite momentâneo. Aguarde alguns instantes e tente novamente.'):'A assistente está indisponível agora. Tente novamente em instantes.',code:limited?(daily?'AI_DAILY_LIMIT':'AI_RATE_LIMIT'):'AI_RESPONSE_ERROR'};return [{json:{status:limited?429:503,headers:ctx.headers,result}}];};
let out;try{const content=$input.first().json.choices[0].message.content;if(typeof content!=='string'||!content.trim())return fail();try{const parsed=JSON.parse(content);out=typeof parsed.reply==='string'&&parsed.state?parsed:null;}catch{}if(!out){const timeline=ctx.message.match(/(?:em\s+(?:ate\s+|até\s+)?)?\d+\s*(?:dias|meses)|o quanto antes|s[oó] pesquisando/i)?.[0]||null;out={reply:content.trim(),state:{intent:'Conversa em andamento',lead:{timeline}},reason:'Conversa respondida pela IA; fatos operacionais validados no servidor.'};}}catch{return fail();}
if(!session||typeof out.reply!=='string'||!out.state||typeof out.state!=='object'||Array.isArray(out.state)||out.reply.length>2400)return fail();
const n=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),text=n(ctx.message),prior=ctx.previous,s=out.state;
const shortYes=/^(sim(?:[, ]+(?:pode confirmar|confirmo|por favor))?|confirmo|pode confirmar|pode ser)[.! ]*$/.test(text);
s.human=prior.human||(shortYes&&prior.awaiting==='handoff_offer')||((/quero|preciso|cham|pode encaminhar|falar com|pode passar/.test(text)||/^(humano|atendente|corretor)$/.test(text))&&/atendente|humano|uma pessoa|responsavel|corretor|equipe/.test(text)&&!/nao quero|nao precisa|nao chame/.test(text));
// Only demo owner controls can recognize money received.
if(prior.payment?.status==='received')s.payment=prior.payment;
else if(s.payment){if(s.payment.status!=='declared'||!Number.isInteger(s.payment.amount)||s.payment.amount<1||s.payment.amount>10000000)s.payment=prior.payment||null;}
if(/geladeira|uber|aluguel da minha casa|mercado|outro salao|nao paguei|nao fiz o pix|vou pagar|farei o pix/.test(text))s.payment=prior.payment||null;
if(ctx.segment==='salao'){
 const named=/cronograma/.test(text)?'Cronograma':/tratamento|hidratacao|nutricao|reconstrucao/.test(text)?'Tratamento':/corte/.test(text)?'Corte':/mechas|luzes/.test(text)?'Mechas':null;if(named&&!/geladeira|uber|outro salao|vou pensar/.test(text))s.service=named;if(/quanto|preco|valor|custa/.test(text)){s.intent='Perguntou sobre o serviço';if(prior.appointment)s.appointment=prior.appointment;}const service=n(s.service);const price=/cronograma/.test(service)?45000:/tratamento|hidratacao|nutricao|reconstrucao/.test(service)?20000:/corte/.test(service)?8000:null;s.expected=price;
 if(s.appointment?.status==='confirmed'&&prior.appointment?.status!=='confirmed'){s.appointment.status='requested';out.reply=out.reply.replace(/(?:seu )?hor[aá]rio (?:est[aá] )?confirmado[!.]?/gi,'Seu horário está solicitado e aguarda confirmação da equipe.');}
 if(s.appointment?.status==='requested'&&(!prior.appointment||prior.appointment.date!==s.appointment.date||prior.appointment.time!==s.appointment.time))out.reply=`Anotei seu pedido de ${s.service} para ${s.appointment.date} às ${s.appointment.time}. A equipe vai conferir a duração e a disponibilidade antes de confirmar. Por enquanto, o horário está solicitado.`;
 if(s.appointment&&(!s.service||!s.appointment.date||!/^\d{2}:\d{2}$/.test(s.appointment.time||'')))s.appointment=null;
 if(/nao vou fazer|desisti|nao quero mais|cancelar|desmarcar/.test(text))s.appointment=prior.appointment?.status==='confirmed'?{...prior.appointment,status:'cancel_requested'}:null;
}
if(s.lead?.type){const t=n(s.lead.type);s.lead.type=/apart/.test(t)?'Apartamento':/casa|sobrado/.test(t)?'Casa':/terreno/.test(t)?'Terreno':s.lead.type;}
if(ctx.segment==='imobiliaria'&&/compra|comprar/i.test(s.lead?.purpose||'')){s.selectedProperty=null;s.visit=null;}
if(s.selectedProperty&&!Number.isInteger(s.selectedProperty))s.selectedProperty=null;
if(s.selectedProperty&&![1,2,3,4].includes(s.selectedProperty))s.selectedProperty=null;
if(ctx.segment==='imobiliaria'&&!s.selectedProperty)s.visit=null;
// Confirmation must follow a concrete proposal and an unambiguous yes.
const yes=/^(sim(?:[,!. ]|$)|confirmo(?:[,!. ]|$)|pode confirmar(?:[,!. ]|$)|confirmar(?:[,!. ]|$))/i.test(text)&&!/nao|talvez|pensar|cancelar/.test(text);
for(const key of ['appointment','visit'])if(ctx.segment!=='salao'&&s[key]?.status==='confirmed'&&prior[key]?.status!=='confirmed'&&(!yes||!prior[key]?.date||!prior[key]?.time)){s[key].status='requested';out.reply='Antes de confirmar, confira: '+(s.service||'visita')+', '+s[key].date+' às '+s[key].time+'. Você confirma?';}
if(ctx.segment==='imobiliaria')guardRealty(ctx,out);
if(ctx.segment==='clinica'||ctx.segment==='salao')guardService(ctx,out);
if(!(session.history||[]).some(m=>m.role==='assistant')&&!/\bIana\b/i.test(out.reply)){const company={clinica:'da Clínica Horizonte Estético',salao:'do Studio Aurora',imobiliaria:'da Horizonte Prime Imóveis'}[ctx.segment];out.reply='Sou a Iana, assistente virtual '+company+'.\n\n'+out.reply;}
const reason=String(out.reason||'Contexto atualizado pela assistente.').slice(0,500);s.intent=String(s.intent||'Em atendimento').slice(0,100);s.service=s.service?String(s.service).slice(0,100):null;
session.state=s;session.updated=Date.now();session.history.push({role:'user',content:ctx.message},{role:'assistant',content:out.reply});session.history=session.history.slice(-10);
return [{json:{status:200,headers:ctx.headers,persist:{state:s,history:session.history},result:{ok:true,mode:'live_ai',provider:$input.first().json.demo_provider||'groq',reply:out.reply,state:s,reason,remaining:Math.max(0,24-session.count)}}}];
