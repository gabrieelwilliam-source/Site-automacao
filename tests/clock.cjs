// Freeze only this test process: production keeps its real America/Sao_Paulo clock.
const NativeDate=global.Date;let instant='2026-10-14T15:00:00Z';
global.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[instant]));}static now(){return new NativeDate(instant).getTime();}};
module.exports={setNow(value){instant=value;}};
