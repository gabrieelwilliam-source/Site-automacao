// Static distribution only: no backend source, tests, credentials or dependencies.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','styles.css','design.css','script.js','salao-demo.js','atendimento-real.js','catalogo-demo.js','premium.js','cinematic.js','assets']){
 fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
}
console.log('Static build ready in dist/; no deployment performed.');
