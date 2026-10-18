/* Source: The Heart of Tibetan Language, Vol. 2, Lesson 11, pp. 7, 11–12, 15.
   Short entries are excerpts of those examples. Paintings and the old bank stay unchanged. */
(()=>{'use strict';
const entries={
 until:{ru:'до',full:'до, вплоть до',form:'བར་དུ་',page:11,meaning:'Показывает конечную точку пути.',examples:[
  ['རྒྱ་ལམ་','','До главной дороги.'],
  ['རྒྱ་ལམ་','གོམ་པ་བརྒྱབ་ནས་འགྲོ་དགོས་རེད།','До главной дороги нужно дойти пешком.']]},
 up:{ru:'вверх',full:'вверх, наверх',form:'ཡར་',page:11,meaning:'Движение снизу вверх.',examples:[
  ['','','Вверх.'],['ང་','McLeod ལ་འགྲོ་གི་ཡིན།','Я поднимусь в Маклеод.']]},
 down:{ru:'вниз',full:'вниз, под гору',form:'མར་',page:11,meaning:'Движение сверху вниз.',examples:[
  ['','','Вниз.'],['ང་','Gaggal ལ་འགྲོ་གི་ཡིན།','Я спущусь в Гаггал.']]},
 roundtrip:{ru:'туда-сюда',full:'туда-сюда; вверх и вниз',form:'ཡར་མར་',page:11,meaning:'Движение в обе стороны; точное значение зависит от фразы.',examples:[
  ['','','Туда-сюда.'],['མོ་ཊ་','ལ་སྒོར་མོ་ག་ཚོད་རེད།','Сколько стоит съездить на машине туда и обратно?']]},
 for:{ru:'для / ради',full:'для, ради, с целью',form:'ཆེད་དུ་',page:15,meaning:'Показывает, для кого или ради чего что-то делают.',examples:[
  ['ཕྲུ་གུའི་','','Для детей.'],
  ['ཨ་མ་ལགས་ཀྱིས་ཕྲུ་གུའི་','རྔན་པ་ཆུང་ཆུང་ཞིག་ཉོས་སོང་།','Мама купила небольшое угощение для детей.']]},
 about:{ru:'о / об',full:'о, об; вокруг',form:'སྐོར་ལ་',page:12,meaning:'Может также означать «вокруг». В этих примерах показывает, о чём говорят.',examples:[
  ['བོད་ཀྱི་','','О Тибете.'],['བོད་ཀྱི་','གསུང་རོགས་གནང་།','Расскажите, пожалуйста, о Тибете.']]},
 farside:{ru:'по ту сторону',full:'по ту сторону, на другой стороне',form:'ཕར་ཕྱོགས་ལ་',page:7,meaning:'Другая сторона относительно того, кто говорит.',examples:[
  ['','','На другую сторону.'],['ང་ཚོ་ཚང་མ་','འགྲོ་དོ།','Давайте все пойдём на другую сторону.']]},
 thisside:{ru:'по эту сторону',full:'по эту сторону, на этой стороне',form:'ཚུར་ཕྱོགས་ལ་',page:7,meaning:'Эта сторона, ближе к тому, кто говорит.',examples:[
  ['','','На эту сторону.'],['ཁྱེད་རང་ཚོ་ཚང་མ་','ཕེབས།','Подойдите, пожалуйста, все на эту сторону.']]}
};
const ids=Object.keys(entries);
const thumbnail=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="#e6eee7"/><path d="M0 215 140 80 285 215 420 60 600 215V300H0" fill="#a7bbab"/><path d="M0 245 135 173 285 245 424 146 600 235V300H0" fill="#6b8b75"/><path d="M85 270Q185 160 300 230T520 125" fill="none" stroke="#f5e8cc" stroke-width="30" stroke-linecap="round"/><path d="M85 270Q185 160 300 230T520 125" fill="none" stroke="#bc8c4a" stroke-width="3" stroke-dasharray="7 10"/><circle cx="85" cy="270" r="12" fill="#803f30"/><path d="M515 71v67m0-67 40 13-40 14" stroke="#803f30" stroke-width="5" fill="#d9a152" stroke-linejoin="round"/></svg>`;
const room={title:'Движение и смысл',level:4,label:'Ещё 8 предлогов',lesson:true,width:1000,height:650,objectColors:false,
 thumbnail:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(thumbnail),image:'',refs:{},occluders:{},poses:{},focus:ids,allowed:ids,
 scenes:ids.map(rel=>({id:rel,rel,refs:[],amb:[],decoys:ids.filter(id=>id!==rel)}))};
function install(data){for(const id of ids){const e=entries[id];data.relations[id]={ru:e.ru,full:e.full,forms:[e.form],note:e.meaning};room.poses[id]=[{x:500,y:520,width:150,mask:[]}];}data.rooms.lesson11=room;}
function question(scene,index,rid){const e=entries[scene.rel],example=e.examples[index%e.examples.length];const q={type:'scene',id:rid+'-'+scene.rel+'-'+index%e.examples.length,room:rid,scene:scene.id,rel:scene.rel,index,refs:[],form:e.form,head:example[0],tail:example[1],ru:example[2],words:[],chosen:null,ok:null,hint:false,sourcePage:e.page};q.bo=q.head+q.form+q.tail;return q;}
let serial=0;
function art(id,cat,staticImage=false,labels=false){
 const uid='lesson-art-'+(++serial),forest='#355f50',copper='#9c5742',gold='#c69650',ink='#4d493e';
 const animate=!staticImage&&!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 const txt=(x,y,s,bo=false)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${ink}" font-size="${bo?34:26}" font-family="${bo?'Noto Serif Tibetan,serif':'Golos Text,system-ui,sans-serif'}" ${bo?'lang="bo"':''}>${s}</text>`;
 const label=(x,y,s)=>labels?txt(x,y,s,true):'';
 const path=(d,w=9,color=gold,dash='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const catFace=(x,y,w=150)=>`<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="${w*.30}" ry="${w*.045}" fill="#33483d" opacity=".14"/><image href="${cat.src}" x="${-w/2}" y="${-w}" width="${w}" height="${w}" preserveAspectRatio="xMidYMax meet"/></g>`;
 const walker=(points,duration=5,reverse=false)=>{if(reverse)points=points.slice().reverse();const last=points[points.length-1],motion=points.map(p=>p.join(' ')).join(';');return `<g transform="translate(${last.join(' ')})">${animate?`<animateTransform attributeName="transform" type="translate" values="${motion}" dur="${duration}s" repeatCount="indefinite"/>`:''}${catFace(0,0,145)}</g>`;};
 const house=(x,y,color=forest)=>`<g transform="translate(${x} ${y})"><rect x="-61" y="-98" width="122" height="98" rx="7" fill="#f7e8cd" stroke="${color}" stroke-width="5"/><path d="m-76-94 76-62 76 62" fill="${color}" stroke="${color}" stroke-width="6" stroke-linejoin="round"/><rect x="-15" y="-55" width="30" height="55" rx="5" fill="${copper}"/><path d="M-48-71h22v25h-22zM26-71h22v25H26z" fill="${gold}"/></g>`;
 const start=`<g transform="translate(145 485)"><circle cy="-80" r="19" fill="#e9c38d" stroke="${forest}" stroke-width="4"/><path d="M-30-12v-30q0-27 30-27t30 27v30M0-10v36m-24-2 24-34 24 34" fill="none" stroke="${forest}" stroke-width="9" stroke-linecap="round"/></g>${txt(145,560,'Вы здесь')}`;
 let body='';
 if(id==='up'||id==='down'){
  body=path('M100 555H840',4,'#c9d1bb')+'<path d="M180 520h100v-60h90v-60h90v-60h90v-60h90v-60h130v330H180Z" fill="#e2d3b7" stroke="#b29c78" stroke-width="5" stroke-linejoin="round"/>'+house(770,220)+walker([[190,520],[255,520],[300,460],[345,460],[390,400],[435,400],[480,340],[525,340],[570,280],[615,280],[660,220],[700,220]],6,id==='down')+label(800,150,'ནང་');
 }else if(id==='until'){
  body='<path d="M730 100v460" stroke="#d4c3a7" stroke-width="120"/>'+path('M730 100V560',4,'#fff8e8','15 17')+path('M140 480H660',58,'#e5d6b7')+path('M140 480H650',4,gold,'9 12')+`<path d="M660 390v110" stroke="${copper}" stroke-width="5"/><path d="m660 390 52 17-52 17" fill="${copper}"/>`+walker([[180,480],[180,480],[610,480],[610,480]],5)+label(750,90,'རྒྱ་ལམ་');
 }else if(id==='roundtrip'){
  body=house(170,380)+house(830,380,copper)+path('M140 490H860',78,'#dfcfb0')+path('M140 490H860',4,'#fff9e9','15 16');
  body+=`<g transform="translate(250 470)">${animate?'<animateTransform attributeName="transform" type="translate" values="250 470;750 470;250 470" dur="7s" repeatCount="indefinite"/>':''}<rect x="-80" y="-70" width="160" height="65" rx="14" fill="${forest}"/><path d="m-48-70 22-35h52l22 35" fill="${forest}"/><path d="m-29-77 14-21h28l14 21" fill="#e7f0dd"/><circle cx="-45" cy="-2" r="17" fill="${ink}"/><circle cx="45" cy="-2" r="17" fill="${ink}"/><circle cx="-45" cy="-2" r="7" fill="#e7dac0"/><circle cx="45" cy="-2" r="7" fill="#e7dac0"/></g>`+catFace(900,600,120)+label(495,570,'མོ་ཊ་');
 }else if(id==='farside'||id==='thisside'){
  body='<path d="M500 75q-110 120 0 235t0 270" fill="none" stroke="#b4d2cc" stroke-width="115"/>'+path('M475 100q-70 100 0 200t0 250',3,'#e5f1e8')+'<path d="M270 437H760v55H270z" fill="#d2ac76" stroke="#987347" stroke-width="4"/>'+path('M270 425H760M270 510H760',9,'#987347')+house(850,390,copper)+start+walker([[245,437],[300,437],[740,437],[785,437]],5,id==='thisside')+label(850,220,'ནང་');
 }else if(id==='for'){
  body=catFace(200,510,165)+path('M335 385H610',5,gold,'7 13')+`<g transform="translate(460 340)"><rect x="-70" y="0" width="140" height="115" rx="9" fill="#e9c690" stroke="${copper}" stroke-width="4"/><rect x="-79" y="-18" width="158" height="35" rx="5" fill="${copper}"/><path d="M0-16v131" stroke="#fff0d4" stroke-width="20"/><path d="M0-18c-65-55-73-5-38 0h38c65-55 73-5 38 0H0" fill="none" stroke="${copper}" stroke-width="10"/></g>`;
  for(const [x,y] of [[705,390],[810,410]])body+=`<g transform="translate(${x} ${y})"><circle cy="-60" r="29" fill="#e4b580"/><path d="M-37 25v-40q0-30 37-30t37 30v40" fill="${x===705?forest:copper}"/><path d="M-22 20v60m44-60v60" stroke="${ink}" stroke-width="15" stroke-linecap="round"/></g>`;
  body+=label(770,555,'ཕྲུ་གུ་');
 }else if(id==='about'){
  body=catFace(200,530,165)+`<path d="M315 215q0-30 32-30h460q32 0 32 30v180q0 30-32 30H440l-76 57 20-57h-37q-32 0-32-30Z" fill="#fff9eb" stroke="#c9b28c" stroke-width="5"/><g transform="translate(577 312)"><path d="M0-65q-80-35-160-10v160q80-25 160 10 80-35 160-10V-75Q80-100 0-65Z" fill="#f1dfb9" stroke="${copper}" stroke-width="5"/><path d="M0-65V95" stroke="${copper}" stroke-width="4"/><path d="m-135 28 40-58 42 58 27-30 12 30" fill="none" stroke="${forest}" stroke-width="7" stroke-linejoin="round"/></g>`+txt(655,333,'བོད་',true)+label(575,535,'དེབ་');
 }else body=house(710,440)+catFace(360,520);
 return `<defs><linearGradient id="${uid}-bg" x2="0" y2="1"><stop stop-color="#edf1e5"/><stop offset="1" stop-color="#f7eddb"/></linearGradient></defs><rect width="1000" height="650" fill="url(#${uid}-bg)"/><path d="M0 235 160 110l130 125L475 85l200 150L840 100l160 135v415H0Z" fill="#dbe4cf" opacity=".7"/><path d="M0 520q250-75 500 0t500 0v130H0Z" fill="#e9dec6"/>${body}`;
}
window.LESSON11={entries,ids,room,install,question,art};
})();
