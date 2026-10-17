const fs=require('fs'),path=require('path'),cp=require('child_process'),css=require('css-tree');
process.chdir(path.resolve(__dirname,'..'));
for(const f of ['script.js','salao-demo.js','atendimento-real.js','premium.js','cinematic.js'])cp.execFileSync(process.execPath,['--check',f]);
for(const f of ['styles.css','design.css','assets/fonts/fonts.css']){const errors=[];css.parse(fs.readFileSync(f,'utf8'),{onParseError:e=>errors.push(e.message)});if(errors.length)throw Error(f+': '+errors.join('\n'));}
console.log('Lint passed: JavaScript syntax and CSS parsing.');
