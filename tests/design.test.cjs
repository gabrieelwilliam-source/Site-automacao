const fs=require('fs'),path=require('path'),assert=require('assert'),css=require('css-tree'),{JSDOM}=require('jsdom'),crypto=require('crypto');
process.chdir(path.resolve(__dirname,'..'));
const html=fs.readFileSync('index.html','utf8'),source=['styles.css','design.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const manifest=JSON.parse(fs.readFileSync('assets/brand/provenance.json'));
for(const item of Object.values(manifest))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.file)).digest('hex'),item.sha256);
let count=2;
for(const width of [360,390,768,1024,1440]){
 const ast=css.parse(source);css.walk(ast,{visit:'Atrule',enter(n,item,list){if(n.name==='layer'){list.replace(item,n.block.children.copy());return;}if(n.name==='media'){
  const q=css.generate(n.prelude);let enabled=true;
  for(const m of q.matchAll(/(min|max)-width:\s*(\d+)px/g))if(m[1]==='min'?width<+m[2]:width>+m[2])enabled=false;
  if(/prefers-reduced-motion|prefers-color-scheme/.test(q))enabled=false;
  if(enabled)list.replace(item,n.block.children.copy());else list.remove(item);
 }}});
 const dom=new JSDOM(html),w=dom.window;const st=w.document.createElement('style');st.textContent=css.generate(ast);w.document.head.append(st);const get=s=>w.getComputedStyle(w.document.querySelector(s));
 assert.equal(get('.hero-grid').gridTemplateColumns,width<=820?'minmax(0,1fr)':width<=1080?'minmax(0,1.05fr) minmax(0,.95fr)':'minmax(0,1.1fr) minmax(0,.9fr)');
 assert.equal(get('body').backgroundColor,'rgb(250, 248, 243)');
 assert.equal(get('#iana-servicos').backgroundColor,'rgb(250, 248, 243)');
 assert.equal(get('.menu-button').display,width<=1080?'block':'none');
 assert.equal(get('.solution-grid').gridTemplateColumns,width<=520?'minmax(0,1fr)':width<=1080?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))');
 assert.equal(get('.demo-tabs').gridTemplateColumns,width<=520?'repeat(2,minmax(0,1fr))':'repeat(4,minmax(0,1fr))');
 assert.equal(get('.hero h1').color,'rgb(7, 26, 49)');
 assert.equal(get('.official-wordmark').filter,'none');
 assert.notEqual(get('.reveal').opacity,'0');
 count+=9;dom.window.close();
}
console.log(JSON.stringify({checks:count,passed:count,widths:[360,390,768,1024,1440],limitation:'Static CSS cascade checks; not rendered browser or screenshot verification'}));
