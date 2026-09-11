const tabs = document.querySelectorAll('.demo-tab');
const contents = document.querySelectorAll('.demo-content');

function openDemo(name){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.demo === name));
  contents.forEach(c => c.classList.toggle('active', c.id === `demo-${name}`));
  document.querySelector('#demo').scrollIntoView({behavior:'smooth'});
}

tabs.forEach(tab => tab.addEventListener('click', () => openDemo(tab.dataset.demo)));
document.querySelectorAll('[data-open-demo]').forEach(card => card.addEventListener('click', () => openDemo(card.dataset.openDemo)));

const clinicForm = document.querySelector('#clinicForm');
const clinicInput = document.querySelector('#clinicInput');
const clinicChat = document.querySelector('#clinicChat');

const responses = [
  {terms:['limpeza','pele'], text:'Claro 😊 A limpeza de pele ajuda a remover impurezas e deixar a pele mais equilibrada. Se quiser, posso seguir com você e entender melhor o que está buscando.'},
  {terms:['agendar','agendamento','horário','horario'], text:'Perfeito 😊 Posso te ajudar com isso. Para começar, qual procedimento você gostaria de realizar?'},
  {terms:['valor','preço','preco'], text:'Os valores podem variar conforme o procedimento e a avaliação. Posso registrar seu interesse e encaminhar para a equipe responsável continuar com você.'},
  {terms:['oi','olá','ola','bom dia','boa tarde','boa noite'], text:'Oi! 😊 Tudo bem? Me conta como posso ajudar você hoje.'}
];

function addMessage(text, who){
  const el = document.createElement('div');
  el.className = `msg ${who}`;
  el.textContent = text;
  clinicChat.appendChild(el);
  clinicChat.scrollTop = clinicChat.scrollHeight;
}

function respond(text){
  const lower = text.toLowerCase();
  const match = responses.find(r => r.terms.some(term => lower.includes(term)));
  setTimeout(() => addMessage(match ? match.text : 'Entendi 😊 Posso te ajudar com isso. Nesta demonstração, eu simulo a conversa; depois podemos conectar este chat diretamente à automação real.', 'bot'), 450);
}

clinicForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = clinicInput.value.trim();
  if(!text) return;
  addMessage(text, 'user');
  clinicInput.value = '';
  respond(text);
});

document.querySelectorAll('[data-chat-preset]').forEach(btn => btn.addEventListener('click', () => {
  const text = btn.dataset.chatPreset;
  addMessage(text,'user');
  respond(text);
}));

const stockInput = document.querySelector('#stockInput');
const salesInput = document.querySelector('#salesInput');
const safetyInput = document.querySelector('#safetyInput');
const stockResult = document.querySelector('#stockResult strong');

document.querySelector('#calcStock').addEventListener('click', () => {
  const stock = Number(stockInput.value) || 0;
  const sales = Number(salesInput.value) || 0;
  const safety = Number(safetyInput.value) || 0;
  const suggested = Math.max(0, sales + safety - stock);
  stockResult.innerHTML = `${suggested} <span>unidades</span>`;
});

const leadQuestion = document.querySelector('#leadQuestion');
const leadScore = document.querySelector('#leadScore');
const leadProgress = document.querySelector('#leadProgress');
const summary = document.querySelectorAll('#leadSummary strong');
let leadState = {intent:null,type:null,region:null};

function renderLeadStep(step){
  if(step === 2){
    leadScore.textContent = '60%'; leadProgress.style.width='60%'; summary[0].textContent = leadState.intent;
    leadQuestion.innerHTML = `<small>PERGUNTA ATUAL</small><h4>Qual tipo de imóvel?</h4><div class="option-grid"><button data-step2="Casa">Casa</button><button data-step2="Apartamento">Apartamento</button></div>`;
    leadQuestion.querySelectorAll('[data-step2]').forEach(b=>b.addEventListener('click',()=>{leadState.type=b.dataset.step2; renderLeadStep(3)}));
  }
  if(step === 3){
    leadScore.textContent = '82%'; leadProgress.style.width='82%'; summary[1].textContent = leadState.type;
    leadQuestion.innerHTML = `<small>PERGUNTA ATUAL</small><h4>Qual região você prefere?</h4><div class="option-grid"><button data-step3="Costa e Silva">Costa e Silva</button><button data-step3="Centro">Centro</button></div>`;
    leadQuestion.querySelectorAll('[data-step3]').forEach(b=>b.addEventListener('click',()=>{leadState.region=b.dataset.step3; renderLeadStep(4)}));
  }
  if(step === 4){
    leadScore.textContent = '100%'; leadProgress.style.width='100%'; summary[2].textContent = leadState.region;
    leadQuestion.innerHTML = `<small>QUALIFICAÇÃO CONCLUÍDA</small><h4>Lead pronto para o corretor.</h4><p style="color:#8fa3b5;font-size:13px;margin:0">Intenção, tipo de imóvel e região já estão organizados para o próximo atendimento.</p>`;
  }
}

document.querySelectorAll('[data-lead]').forEach(b=>b.addEventListener('click',()=>{leadState.intent=b.dataset.lead==='alugar'?'Aluguel':'Compra'; renderLeadStep(2)}));
