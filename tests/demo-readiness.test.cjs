const fs=require('fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const g=new Function(fs.readFileSync('server-demo/imobiliaria-guard.js','utf8')+'\n'+fs.readFileSync('server-demo/service-guard.js','utf8')+'\nreturn {guardRealty,guardService};')();let rows=[];
function ck(name,f){try{f();rows.push({name,passed:true})}catch(e){rows.push({name,passed:false,error:e.message})}}
function turn(seg,message,previous={}){let out={reply:'',state:{...previous,lead:previous.lead||{}}};g[seg==='imobiliaria'?'guardRealty':'guardService']({segment:seg,message,previous,session:{history:[]}},out);return out;}
ck('nine_services',()=>{const x=turn('clinica','Quais tratamentos vocês fazem?');for(const t of ['Avaliação','Limpeza','Botox','Preenchimento','Bioestimulador','HIFU','Laser','Radiofrequência','Criolipólise'])assert(x.reply.includes(t),t);assert(!x.state.appointment)});
ck('other_services_after_laser',()=>assert(turn('clinica','Quero conhecer outros procedimentos',{service:'Laser para Melasma e Manchas'}).reply.includes('Criolipólise')));
ck('hifu_price',()=>assert.equal(turn('clinica','Quanto custa HIFU?').state.expected,220000));
ck('filler_price',()=>assert.equal(turn('clinica','Quanto custa preenchimento?').state.expected,150000));
ck('expression_lines',()=>assert(turn('clinica','Quero entender linhas de expressão').reply.includes('Botox')));
ck('browse_four_properties',()=>{let x=turn('imobiliaria','Quero ver imóveis disponíveis');assert.deepEqual(x.state.propertyMatches,[1,2,3,4]);assert(x.reply.includes('2.650,00'));assert(!x.state.visit)});
ck('browse_respects_criteria',()=>assert.deepEqual(turn('imobiliaria','Quero ver imóveis: apartamento, Costa e Silva, 3 quartos até 3000').state.propertyMatches,[]));
ck('specific_property_selection',()=>assert.equal(turn('imobiliaria','Quero ver imóveis disponíveis, especialmente o imóvel 3: Apartamento Garden Costa e Silva').state.selectedProperty,3));
ck('purchase_not_rental',()=>assert.deepEqual(turn('imobiliaria','Quero ver imóveis para comprar').state.propertyMatches,[]));
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://gabrieelwilliam-source.github.io/Site-automacao/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
w.MutationObserver=class{observe(){}disconnect(){}};w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.ResizeObserver=class{observe(){}disconnect(){}};w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.requestAnimationFrame=()=>0;
for(const s of w.document.querySelectorAll('script:not([src])'))if(!s.type||s.type==='text/javascript')w.eval(s.textContent);
for(const f of ['script.js','salao-demo.js','atendimento-real.js','catalogo-demo.js'])w.eval(fs.readFileSync(f,'utf8'));
ck('nine_clinic_cards',()=>assert.equal(w.document.querySelectorAll('#clinicaCatalog .demo-catalog-card').length,9));
ck('property_cards_images_prices',()=>{let cards=w.document.querySelectorAll('#imobiliariaCatalog .demo-catalog-card');assert.equal(cards.length,4);for(const c of cards){assert(c.querySelector('img').alt.includes('ilustrativa'));assert(c.querySelector('strong').textContent.includes('R$'))}});
ck('catalogs_inside_panels',()=>{for(const s of ['clinica','imobiliaria'])assert.equal(w.document.getElementById(s+'Catalog').closest('[role=tabpanel]').contains(w.document.getElementById(s==='clinica'?'clinicChat':'leadChat')),true)});
ck('compact_catalogs_collapsed',()=>{for(const s of ['clinica','imobiliaria'])assert(!w.document.getElementById(s+'Catalog').open)});
console.log(JSON.stringify({suite:'demo_readiness',total:rows.length,passed:rows.filter(x=>x.passed).length,results:rows}));dom.window.close();if(rows.some(x=>!x.passed))process.exitCode=1;
