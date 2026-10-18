/* Painted cat stories. Walking frames were generated from the seven existing cats.
   All paths use the actual ground in the paintings; no furniture is moved. */
(()=>{'use strict';
const W=1000,H=667;
const FRAMES={"ginger":[{"x":15,"y":97,"w":507,"h":366,"cx":268.0,"foot":460},{"x":534,"y":109,"w":467,"h":360,"cx":767.0,"foot":466},{"x":1019,"y":97,"w":506,"h":367,"cx":1271.5,"foot":461},{"x":14,"y":582,"w":489,"h":367,"cx":258.0,"foot":946},{"x":531,"y":603,"w":471,"h":346,"cx":766.0,"foot":946},{"x":1019,"y":578,"w":501,"h":366,"cx":1269.0,"foot":941}],"gray":[{"x":15,"y":97,"w":507,"h":367,"cx":268.0,"foot":461},{"x":535,"y":105,"w":467,"h":364,"cx":768.0,"foot":466},{"x":1020,"y":95,"w":507,"h":370,"cx":1273.0,"foot":462},{"x":14,"y":578,"w":490,"h":371,"cx":258.5,"foot":946},{"x":532,"y":596,"w":472,"h":353,"cx":767.5,"foot":946},{"x":1020,"y":575,"w":502,"h":370,"cx":1270.5,"foot":942}],"black":[{"x":17,"y":94,"w":505,"h":370,"cx":269.0,"foot":461},{"x":537,"y":106,"w":466,"h":363,"cx":769.5,"foot":466},{"x":1022,"y":93,"w":505,"h":373,"cx":1274.0,"foot":463},{"x":17,"y":578,"w":488,"h":372,"cx":260.5,"foot":947},{"x":535,"y":598,"w":470,"h":351,"cx":769.5,"foot":946},{"x":1022,"y":573,"w":500,"h":372,"cx":1271.5,"foot":942}],"white":[{"x":16,"y":96,"w":506,"h":368,"cx":268.5,"foot":461},{"x":534,"y":107,"w":468,"h":362,"cx":767.5,"foot":466},{"x":1018,"y":95,"w":508,"h":370,"cx":1271.5,"foot":462},{"x":14,"y":582,"w":490,"h":367,"cx":258.5,"foot":946},{"x":532,"y":602,"w":471,"h":347,"cx":767.0,"foot":946},{"x":1018,"y":577,"w":503,"h":368,"cx":1269.0,"foot":942}],"gray-white":[{"x":16,"y":95,"w":507,"h":369,"cx":269.0,"foot":461},{"x":533,"y":100,"w":470,"h":370,"cx":767.5,"foot":467},{"x":1019,"y":93,"w":507,"h":373,"cx":1272.0,"foot":463},{"x":15,"y":577,"w":489,"h":373,"cx":259.0,"foot":947},{"x":531,"y":596,"w":473,"h":354,"cx":767.0,"foot":947},{"x":1016,"y":575,"w":506,"h":371,"cx":1268.5,"foot":943}],"calico":[{"x":15,"y":95,"w":509,"h":370,"cx":269.0,"foot":462},{"x":535,"y":107,"w":469,"h":363,"cx":769.0,"foot":467},{"x":1021,"y":95,"w":507,"h":371,"cx":1274.0,"foot":463},{"x":13,"y":580,"w":492,"h":370,"cx":258.5,"foot":947},{"x":532,"y":600,"w":473,"h":350,"cx":768.0,"foot":947},{"x":1019,"y":576,"w":503,"h":369,"cx":1270.0,"foot":942}],"brown-white":[{"x":18,"y":94,"w":509,"h":370,"cx":272.0,"foot":461},{"x":539,"y":103,"w":468,"h":366,"cx":772.5,"foot":466},{"x":1024,"y":95,"w":505,"h":371,"cx":1276.0,"foot":463},{"x":20,"y":577,"w":489,"h":373,"cx":264.0,"foot":947},{"x":536,"y":588,"w":473,"h":362,"cx":772.0,"foot":947},{"x":1024,"y":573,"w":501,"h":372,"cx":1274.0,"foot":942}]};
const frameBox=(coat,i)=>FRAMES[coat][i];
const coatId=cat=>({original:'gray',tabby:'gray-white',siamese:'brown-white'}[cat.id]||cat.id||'gray');
const asset=name=>name+'.webp?v=10.0.2';
const reverse=points=>points.slice().reverse();
const bridge=[[190,385],[310,379],[450,370],[550,370],[690,379],[800,385]];
const hill=[[230,570],[360,525],[530,462],[710,391],[835,350]];
const scenes={
 until:{background:'bridge',points:[[110,390],[165,386],[220,382]],duration:3000,intro:900,settle:650,call:null,question:'До чего дошла кошка?',introText:'Кошка отправилась на прогулку',label:[500,468,'ཟམ་པ་']},
 up:{background:'hill',points:hill,duration:6700,intro:950,settle:650,call:[865,135],question:'Выберите подходящий предлог.',introText:'Кошку позвали',label:[905,285,'ཁང་པ་']},
 down:{background:'hill',points:reverse(hill),duration:6700,intro:950,settle:650,call:[140,290],question:'Выберите подходящий предлог.',introText:'Кошку позвали',label:[905,285,'ཁང་པ་']},
 roundtrip:{background:'bridge',points:[...bridge,...reverse(bridge).slice(1)],duration:10000,intro:950,settle:650,call:[865,135],question:'Выберите подходящий предлог.',introText:'Кошку позвали',label:[500,468,'ཟམ་པ་']},
 farside:{background:'bridge',points:bridge,duration:6000,intro:950,settle:650,call:[865,135],question:'Выберите подходящий предлог.',introText:'Кошку позвали',label:[500,468,'ཟམ་པ་']},
 thisside:{background:'bridge',points:reverse(bridge),duration:6000,intro:950,settle:650,call:[140,135],question:'Выберите подходящий предлог.',introText:'Кошку позвали',label:[500,468,'ཟམ་པ་']},
 for:{background:'home',points:[[810,593],[670,585],[560,580],[480,575]],duration:4800,intro:950,settle:650,call:[185,190],question:'Для кого приготовили угощение?',introText:'Хозяйка позвала кошку к миске',label:[350,626,'རྔན་པ་']},
 about:{background:'home',points:[[800,591],[700,582],[590,575]],duration:4400,intro:950,settle:650,call:null,question:'О ком рассказывает хозяйка?',introText:'Хозяйка открыла книгу',label:[328,375,'དེབ་']}
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function pointAt(points,t){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0);let d=clamp(t)*total,index=0;
 while(index<lengths.length-1&&d>lengths[index])d-=lengths[index++];
 const p=points[index],q=points[index+1],u=lengths[index]?clamp(d/lengths[index]):1;
 return {x:p[0]+(q[0]-p[0])*u,y:p[1]+(q[1]-p[1])*u,flip:q[0]<p[0],distance:total*clamp(t)};
}
function sample(id,elapsed){
 const s=scenes[id]||scenes.farside,t=clamp(elapsed,0,s.duration),raw=clamp((t-s.intro)/(s.duration-s.intro-s.settle));
 // Gentle acceleration/deceleration; most of the walk has a constant pace.
 const ease=raw<.12?raw*raw/.2112:raw>.88?1-(1-raw)*(1-raw)/.2112:(raw-.06)/.88;
 const p=pointAt(s.points,clamp(ease));
 const moving=t>=s.intro&&t<s.duration-s.settle;
 const phase=t<s.intro?'call':moving?'walk':t<s.duration?'settle':'done';
 let size=185;
 if(s.background==='hill')size=185-(570-p.y)/220*35;
 const frame=Math.floor(p.distance/90*6)%6;
 return {...p,frame,size,moving,phase,progress:t/s.duration,done:t>=s.duration,elapsed:t};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let serial=0;
function art(id,cat,staticImage=false,labels=false){
 const s=scenes[id]||scenes.farside,p=sample(id,staticImage?s.duration:0),uid='cat-story-'+(++serial),coat=coatId(cat);
 const box=frameBox(coat,p.frame);
 const size=p.size;
 const label=labels?`<text class="story-object-label" x="${s.label[0]}" y="${s.label[1]}" text-anchor="middle" lang="bo">${s.label[2]}</text>`:'';
 const speaker=['farside','thisside','roundtrip'].includes(id)?'<g class="story-speaker-tag" transform="translate(52 114)"><rect width="118" height="35" rx="17"/><text x="59" y="23" text-anchor="middle">Вы здесь</text></g>':'';
 const book=s.background==='home'?`<g clip-path="url(#${uid}-book)"><image href="${esc(cat.src)}" x="273" y="267" width="45" height="52" transform="rotate(-4 295 290)"/><image href="${esc(cat.src)}" x="345" y="264" width="48" height="53" transform="rotate(-7 368 290)"/></g>`:'';
 const bowl=id==='for'?`<g transform="translate(350 559)"><ellipse cy="12" rx="37" ry="9" fill="#3d2b19" opacity=".2"/><path d="M-34-2q3 27 34 27T34-2" fill="#517e79" stroke="#284d49" stroke-width="2"/><ellipse rx="34" ry="10" fill="#e7c99a" stroke="#a27d4b" stroke-width="2"/>${[-21,-11,0,10,21].map((x,i)=>`<ellipse cx="${x}" cy="${i%2?-3:1}" rx="6" ry="4" fill="${i%2?'#ac7342':'#744b2c'}"/>`).join('')}</g>`:'';
 return `<defs><clipPath id="${uid}-book"><path d="M264 263 311 263 326 321 269 323zM317 262 374 257 391 321 329 322z"/></clipPath></defs><image class="story-background" href="${asset('story-'+s.background)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>${book}${bowl}${speaker}<g data-story-focus class="story-focus" opacity="${staticImage&&['for','about'].includes(id)?.5:0}"><ellipse cx="${id==='for'?350:335}" cy="${id==='for'?562:293}" rx="${id==='for'?47:86}" ry="${id==='for'?18:56}"/></g><g data-story-actor transform="translate(${p.x} ${p.y})"><ellipse class="story-ground-shadow" rx="${size*.29}" ry="${size*.04}"/><g data-story-facing transform="scale(${p.flip?-1:1} 1)"><svg data-story-walk x="${-(box.cx-box.x)/512*size}" y="${-(box.foot-box.y)/512*size}" width="${box.w/512*size}" height="${box.h/512*size}" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" overflow="hidden" opacity="${p.moving?1:0}"><image href="${asset('walk-'+coat)}" width="1536" height="1024"/></svg></g><image data-story-idle href="${esc(cat.src)}" x="-66" y="-132" width="132" height="132" preserveAspectRatio="xMidYMax meet" opacity="${p.moving?0:1}"/></g>${label}<g data-story-call class="story-call" opacity="0"><path d="M-68-27h136q14 0 14 14v28q0 14-14 14H10L0 44-10 29h-58q-14 0-14-14v-28q0-14 14-14Z"/><text text-anchor="middle" y="8">Кис-кис!</text></g>`;
}
const cache=new Map(),images=new Map();let active=null;
function imageReady(src){if(images.has(src))return images.get(src);const p=new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=()=>{images.delete(src);reject(new Error('image-load'))};im.src=src;if(im.complete&&im.naturalWidth)resolve();});images.set(src,p);return p;}
function pause(){if(!active)return;active.paused=true;if(active.raf)cancelAnimationFrame(active.raf);active.raf=0;cache.set(active.key,{elapsed:active.elapsed});notify();}
function blocked(){return !!active&&(active.loading||active.elapsed<active.spec.duration);}
function state(){if(!active)return {blocked:false};return {blocked:blocked(),loading:active.loading,paused:active.paused,reduced:active.reduced,error:active.error,...sample(active.id,active.elapsed)};}
function notify(){if(active)active.options.onState?.(state());}
function paint(a){
 const p=sample(a.id,a.elapsed),box=frameBox(coatId(a.cat),p.frame);
 a.actor.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
 a.facing.setAttribute('transform',`scale(${p.flip?-1:1} 1)`);
 a.walk.setAttribute('viewBox',`${box.x} ${box.y} ${box.w} ${box.h}`);
 a.walk.setAttribute('width',box.w/512*p.size);a.walk.setAttribute('height',box.h/512*p.size);a.walk.setAttribute('x',-(box.cx-box.x)/512*p.size);a.walk.setAttribute('y',-(box.foot-box.y)/512*p.size);
 a.walk.setAttribute('opacity',p.moving?1:0);a.idle.setAttribute('opacity',p.moving?0:1);
 const call=a.spec.call&&(p.phase==='call'||(a.id==='roundtrip'&&p.progress>.43&&p.progress<.56));
 let pos=a.spec.call;if(a.id==='roundtrip'&&p.progress>.43)pos=[140,135];
 a.call.setAttribute('opacity',call?(a.reduced?1:.85+.15*Math.sin(a.elapsed/150)):0);
 if(pos)a.call.setAttribute('transform',`translate(${pos[0]} ${pos[1]})`);
 a.focus.setAttribute('opacity',['for','about'].includes(a.id)&&p.phase!=='call'?.7:0);
 cache.set(a.key,{elapsed:a.elapsed});while(cache.size>40)cache.delete(cache.keys().next().value);
 if(a.lastPhase!==p.phase){a.lastPhase=p.phase;notify();}
 a.options.onProgress?.(p.progress);
}
function complete(a){a.elapsed=a.spec.duration;paint(a);if(!a.doneNotified){a.doneNotified=true;a.options.onDone?.();}notify();}
function tick(now){const a=active;if(!a||a.paused||a.loading||a.reduced)return;
 const dt=Math.max(0,now-a.last);a.last=now;a.elapsed=Math.min(a.spec.duration,a.elapsed+dt);paint(a);
 if(a.elapsed>=a.spec.duration){a.raf=0;complete(a);}else a.raf=requestAnimationFrame(tick);
}
function resume(){const a=active;if(!a||a.error)return;a.paused=false;notify();if(a.loading||a.reduced||a.elapsed>=a.spec.duration)return;a.last=performance.now();if(!a.raf)a.raf=requestAnimationFrame(tick);}
function mount(svg,options){
 if(typeof Image==='undefined'||!svg.querySelector)return null;
 pause();const key=options.key+'|'+coatId(options.cat),spec=scenes[options.id]||scenes.farside;
 const previous=cache.get(key),elapsed=previous?previous.elapsed:options.skip?spec.duration:0;
 svg.innerHTML=art(options.id,options.cat,false,options.labels);
 const a={svg,key,id:options.id,spec,cat:options.cat,options,elapsed,loading:true,paused:!!options.paused,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,error:false,raf:0,last:0,lastPhase:null,doneNotified:false,
  actor:svg.querySelector('[data-story-actor]'),facing:svg.querySelector('[data-story-facing]'),walk:svg.querySelector('[data-story-walk]'),idle:svg.querySelector('[data-story-idle]'),call:svg.querySelector('[data-story-call]'),focus:svg.querySelector('[data-story-focus]')};
 active=a;const loading=window.GAME_LOADER?.scene(3);a.loadingScreen=loading;paint(a);notify();
 Promise.all([asset('story-'+spec.background),asset('walk-'+coatId(options.cat)),options.cat.src].map(src=>imageReady(src).then(()=>loading?.step()))).then(()=>{loading?.finish();if(active!==a)return;a.loading=false;notify();if(a.elapsed>=spec.duration)complete(a);else if(!a.paused)resume();}).catch(()=>{loading?.cancel();if(active!==a)return;a.loading=false;a.error=true;notify();});
 return a;
}
function replay(){const a=active;if(!a)return;
 if(a.error){cache.delete(a.key);mount(a.svg,{...a.options,skip:false,paused:false});return;}
 if(a.reduced&&a.elapsed<a.spec.duration){a.elapsed=a.elapsed<a.spec.duration*.5?a.spec.duration*.5:a.spec.duration;paint(a);if(a.elapsed===a.spec.duration)complete(a);notify();return;}
 pause();a.elapsed=0;a.doneNotified=false;a.lastPhase=null;a.error=false;paint(a);resume();
}
function finish(){const a=active;if(!a)return;pause();complete(a);a.paused=false;}
function clear(){active?.loadingScreen?.cancel();pause();active=null;}
window.CAT_STORIES={W,H,scenes,sample,pointAt,art,mount,pause,resume,replay,finish,clear,blocked,state,coatId};
})();
