/* Source: The Heart of Tibetan Language, Vol. 2, Lesson 11, pp. 7, 11–12, 15.
   Source entries are retained below; active cat exercises are author adaptations.
   Original room bank and paintings stay unchanged. */
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
const thumbnail='story-bridge.webp?v=10.0.2';
const room={title:'Движение и смысл',level:4,label:'Ещё 8 предлогов',lesson:true,width:1000,height:667,objectColors:false,
 thumbnail,image:'',refs:{},occluders:{},poses:{},focus:ids,allowed:ids,
 scenes:ids.map(rel=>({id:rel,rel,refs:[],amb:[],decoys:ids.filter(id=>id!==rel)}))};
function install(data){for(const id of ids){const e=entries[id];data.relations[id]={ru:e.ru,full:e.full,forms:[e.form],note:e.meaning};room.poses[id]=[{x:500,y:520,width:150,mask:[]}];}data.rooms.lesson11=room;}
const genRu={original:'серой кошки',ginger:'рыжей кошки',black:'чёрной кошки',white:'белой кошки',tabby:'серо-белой кошки',calico:'пёстрой кошки',siamese:'коричнево-белой кошки'};
function question(scene,index,rid,cat={id:'original',bo:'ཞི་མི་སྐྱ་བོ་',ru:'серая кошка'}){
 const e=entries[scene.rel],specific=index%2===1,subject=specific?cat.bo:'ཞི་མི་',ruCat=specific?cat.ru:'кошка';
 const gen=specific?cat.bo.replace(/་$/,'འི་'):'ཞི་མིའི་',ruGen=specific?genRu[cat.id]:'кошки';
 let head=subject,tail='ཕྱིན་སོང་།',ru='';
 const predicates={until:'дошла до мостика',up:'поднялась вверх',down:'спустилась вниз',roundtrip:'прошлась туда-сюда',farside:'перешла на ту сторону',thisside:'пришла на эту сторону'};
 if(scene.rel==='until')head+='ཟམ་པ་';
 if(scene.rel==='thisside')tail='ཡོང་སོང་།';
 if(scene.rel==='for'){head='ཨ་མ་ལགས་ཀྱིས་'+gen;tail='རྔན་པ་ཆུང་ཆུང་ཞིག་ཉོས་སོང་།';ru='Мама купила небольшое угощение для '+ruGen+'.';}
 else if(scene.rel==='about'){head=gen;tail='གསུང་རོགས་གནང་།';ru='Расскажите, пожалуйста, о '+ruGen.replace(/кошки$/,'кошке')+'.';}
 else ru=ruCat.charAt(0).toUpperCase()+ruCat.slice(1)+' '+predicates[scene.rel]+'.';
 const q={type:'scene',id:rid+'-'+scene.rel+'-'+index%2,room:rid,scene:scene.id,rel:scene.rel,index,refs:[],form:e.form,head,tail,ru,words:[],chosen:null,ok:null,hint:false,sourcePage:e.page,sourceKind:'author-adaptation',storyVersion:10};q.bo=q.head+q.form+q.tail;return q;
}
function art(id,cat,staticImage=false,labels=false){return window.CAT_STORIES.art(id,cat,staticImage,labels);}
window.LESSON11={entries,ids,room,install,question,art};
})();
