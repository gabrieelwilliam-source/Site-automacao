const fs=require('fs'),path=require('path'),assert=require('assert'),css=require('css-tree'),{JSDOM}=require('jsdom');
process.chdir(path.resolve(__dirname,'..'));
const html=fs.readFileSync('index.html','utf8');
assert(require('crypto').createHash('sha256').update(fs.readFileSync('assets/zion-original.png')).digest('hex') === '268071f2243aaf241fca5ce67ab1ea8a9cfa731d14fc723d912563073c20273c','Logo must be the unchanged approved attachment');
const source=['styles.css','design.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
let count=0;
for(const width of [360,390,768,1024,1440]){
 const ast=css.parse(source);css.walk(ast,{visit:'Atrule',enter(node,item,list){if(node.name==='media'){
  const query=css.generate(node.prelude);let enabled=true;
  for(const match of query.matchAll(/(min|max)-width:\s*(\d+)px/g)) if(match[1]==='min'?width<+match[2]:width>+match[2]) enabled=false;
  if(/prefers-reduced-motion|prefers-color-scheme/.test(query))enabled=false;
  if(enabled){list.replace(item,node.block.children.copy());}else list.remove(item);
 }}});
 const dom=new JSDOM(html),w=dom.window;const style=w.document.createElement('style');style.textContent=css.generate(ast);w.document.head.append(style);
 const get=s=>w.getComputedStyle(w.document.querySelector(s));
 assert.equal(get('.hero-grid').gridTemplateColumns,width<=820?'minmax(0,1fr)':width<=1000?'minmax(0,1fr) minmax(0,.85fr)':'minmax(0,1.15fr) minmax(0,.85fr)');
 assert.equal(get('body').backgroundColor,'rgb(250, 249, 246)');
 assert.equal(get('.zion-salon h2').color,'rgb(245, 247, 252)');
 assert.equal(get('.zion-benefits h3').color,'rgb(12, 27, 51)');
 assert.equal(get('.hero h1').color,'rgb(12, 27, 51)');
 assert.equal(get('.menu-button').display,width<=1000?'block':'none');
 assert.equal(get('.zion-benefits').gridTemplateColumns,width<=820?'minmax(0,1fr)':'repeat(2,minmax(0,1fr))');
 count+=7;dom.window.close();
}
console.log(JSON.stringify({checks:count+1,passed:count+1,widths:[360,390,768,1024,1440],limitation:'CSS cascade checks; not browser rendering or pixel verification'}));
