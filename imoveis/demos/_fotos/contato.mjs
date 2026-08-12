/* Monta um contato com todas as fotos de um demo para conferir de uma vez.
   Sem isto a revisao seria abrir 57 arquivos um por um. */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const [pasta, saida, colunas=5] = process.argv.slice(2);
const arq = fs.readdirSync(pasta).filter(f=>/\.jpg$/i.test(f)).sort();
const C=Number(colunas), L=Math.ceil(arq.length/C), CEL=300, ALT=225, ROT=22;
const comps=[];
for (let i=0;i<arq.length;i++){
  const buf = await sharp(path.join(pasta,arq[i])).resize(CEL,ALT,{fit:'cover'}).toBuffer();
  comps.push({input:buf, left:(i%C)*CEL, top:Math.floor(i/C)*(ALT+ROT)});
  const rot = await sharp({text:{text:`<span foreground="#111" size="9000">${arq[i]}</span>`,rgba:true,width:CEL-8,height:ROT-6}}).png().toBuffer();
  comps.push({input:rot, left:(i%C)*CEL+4, top:Math.floor(i/C)*(ALT+ROT)+ALT+3});
}
await sharp({create:{width:C*CEL,height:L*(ALT+ROT),channels:3,background:'#f2f0ec'}})
  .composite(comps).jpeg({quality:78}).toFile(saida);
console.log(saida, arq.length+' fotos');
