const fs=require('fs'),path=require('path'),assert=require('assert'),css=require('css-tree'),{JSDOM}=require('jsdom');process.chdir(path.resolve(__dirname,'..'));
const legacy=fs.readFileSync('styles.css','utf8'),design=fs.readFileSync('design.css','utf8'),html=fs.readFileSync('index.html','utf8');const results=[];const check=(name,fn)=>{try{fn();results.push({name,passed:true})}catch(e){results.push({name,passed:false,error:e.message})}};
check('obsolete_forced_theme_patches_removed',()=>{assert(!/!important/.test(legacy.replace(/\/\*[\s\S]*?\*\//g,'')));assert(legacy.includes('@layer legacy'));});
const baseAST=css.parse(legacy);check('single_compatibility_layer',()=>{const layers=[];css.walk(baseAST,{visit:'Atrule',enter(n){if(n.name==='layer')layers.push(css.generate(n.prelude));}});assert.deepEqual(layers,['legacy']);});
function flatten(width){const a=css.parse(legacy+'\n'+design);css.walk(a,{visit:'Atrule',enter(n,item,list){if(n.name==='layer'){list.replace(item,n.block.children.copy());return;}if(n.name==='media'){const q=css.generate(n.prelude);let on=true;for(const m of q.matchAll(/(min|max)-width:\s*(\d+)px/g))if(m[1]==='min'?width<+m[2]:width>+m[2])on=false;if(/prefers-reduced-motion|forced-colors/.test(q))on=false;if(on)list.replace(item,n.block.children.copy());else list.remove(item);}}});return css.generate(a);}
for(const width of [360,390,520,768,1024,1440]){
 const dom=new JSDOM(html),d=dom.window.document;const st=d.createElement('style');st.textContent=flatten(width);d.head.append(st);const get=s=>dom.window.getComputedStyle(d.querySelector(s));
 check(`header_does_not_cover_content_${width}`,()=>assert.equal(get('.site-header').position,'relative'));
 check(`demo_tabs_do_not_float_over_titles_${width}`,()=>assert.equal(get('.demo-tabs').position,'static'));
 check(`no_bottom_overlay_${width}`,()=>{assert(!d.querySelector('.mobile-dock'));assert(!d.querySelector('.smart-float-cta'));});
 check(`method_has_no_dark_number_bars_${width}`,()=>{assert.equal(get('.implementation-grid article>span').backgroundColor,'rgba(0, 0, 0, 0)');assert.equal(get('.implementation-grid b').color,'rgb(7, 26, 49)');if(width<=520)assert.equal(get('.implementation-grid').gridTemplateColumns,'minmax(0,1fr)');});
 check(`service_cards_have_readable_palette_${width}`,()=>{assert.equal(get('.solution-card').backgroundColor,'rgb(255, 255, 255)');assert.equal(get('.solution-card h3').color,'rgb(7, 26, 49)');assert.equal(get('.solution-card p').color,'rgb(80, 97, 116)');});
 check(`personalization_has_no_white_overlay_${width}`,()=>{assert.equal(get('.custom-card').backgroundColor,'rgba(0, 0, 0, 0)');assert.equal(get('.custom-card h3').color,'rgb(7, 26, 49)');assert.equal(get('.custom-card p').color,'rgb(80, 97, 116)');});
 check(`logo_is_unframed_${width}`,()=>{assert.equal(get('.official-wordmark').borderTopWidth,'0px');assert.equal(get('.official-wordmark').filter,'none');assert(!d.querySelector('.hero-visual img'));});
 check(`footer_text_not_hidden_or_stuck_inline_${width}`,()=>{assert.equal(get('.footer p').display,'block');assert.equal(get('.footer-statement>span').display,'block');});
 dom.window.close();
}
function luminance(rgb){return rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
for(const [fg,bg] of [['506174','faf8f3'],['506174','ffffff'],['071a31','faf8f3'],['bac8d7','102b46'],['f4efe6','071a31'],['071a31','d7b46a']])check(`text_contrast_${fg}_${bg}`,()=>{const rgb=x=>x.match(/../g).map(v=>parseInt(v,16)),a=luminance(rgb(fg)),b=luminance(rgb(bg));assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5);});
console.log(JSON.stringify({suite:'reported_visual_regressions_static',total:results.length,passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results,limitation:'CSS structure and contrast checks; no rendered screenshot assertion.'}));if(results.some(r=>!r.passed))process.exitCode=1;
