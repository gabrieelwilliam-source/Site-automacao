const fs=require('fs'),assert=require('assert'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://example.org/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
w.matchMedia=()=>({matches:true,addEventListener(){}});w.IntersectionObserver=class{observe(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){for(let p=this.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')assert(p.open);};w.fetch=()=>{throw Error('Network forbidden')};
for(const f of ['script.js','premium.js'])w.eval(fs.readFileSync(f,'utf8'));
const checks=[];function check(name,f){try{f();checks.push({name,passed:true})}catch(e){checks.push({name,passed:false,error:e.message})}}
check('demo_immediately_follows_hero',()=>assert.equal(d.querySelector('main').children[1].id,'demos'));
check('six_primary_chapters',()=>assert.equal(d.querySelector('main').children.length,6));
for(const p of d.querySelectorAll('.demo-panel')){
 check(p.id+'_perspectives_preserve_conversation',()=>{const input=p.querySelector('input');if(input)input.value='12';p.querySelector('[data-demo-view=management]').click();assert.equal(p.dataset.mobileView,'management');assert.equal(p.querySelector('[data-demo-view=management]').getAttribute('aria-pressed'),'true');p.querySelector('[data-demo-view=conversation]').click();assert.equal(p.dataset.mobileView,'conversation');if(input)assert.equal(input.value,'12');});
 check(p.id+'_options_are_optional',()=>assert(p.querySelector('.demo-support:not([open]),.scenario-picker:not([open])')));
}
check('clinic_scenarios_after_chat',()=>{const x=d.querySelector('.clinic-scenarios');assert(x.closest('details.scenario-picker'));assert(d.querySelector('.clinic-grid').compareDocumentPosition(x)&w.Node.DOCUMENT_POSITION_FOLLOWING);});
check('salon_scenarios_optional',()=>assert(d.querySelector('.salon-scenarios').closest('details:not([open])')));
check('calculators_preserved_under_planning',()=>{for(const id of ['roi','investimento'])assert.equal(d.getElementById(id).closest('details').id,'planejar');});
check('programmatic_navigation_opens_ancestors_before_scroll',()=>{w.zionScrollTo(d.getElementById('roi'));assert(d.getElementById('planejar').open);});
check('hash_navigation_opens_optional_section',()=>{d.getElementById('planejar').open=false;const a=d.createElement('a');a.href='#roi';d.body.append(a);a.click();assert(d.getElementById('planejar').open);});
check('one_contact_block_with_optional_fields',()=>{assert(!d.querySelector('.closing-invitation'));assert(d.querySelector('#contato'));assert(d.querySelector('#proposalCompany').closest('.proposal-brief'));assert(!d.querySelector('#proposalWhatsapp').closest('details'));});
check('short_footer',()=>{assert.equal(d.querySelectorAll('.footer p').length,1);assert(!d.querySelector('.footer-statement p'));});
check('method_descriptions_optional',()=>assert.equal(d.querySelectorAll('.method-step:not([open])').length,5));
check('roi_surface_targets_real_article_markup',()=>{assert.equal(d.querySelectorAll('.roi-results>article').length,3);assert(fs.readFileSync('design.css','utf8').includes('.roi-results>article{background:#f4efe6'));});
const result={suite:'mobile_journey',total:checks.length,passed:checks.filter(x=>x.passed).length,checks,limitation:'DOM and CSS checks only; no rendered viewport verification'};console.log(JSON.stringify(result));dom.window.close();if(result.total!==result.passed)process.exitCode=1;
