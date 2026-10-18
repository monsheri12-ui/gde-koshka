(()=>{'use strict';
const D=JSON.parse(document.getElementById('app-data').textContent),R=D.relations,N=D.nouns,COL=D.colors,ROOMS=D.rooms;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bo=s=>`<span class="bo" lang="bo">${esc(s)}</span>`;
const clone=o=>JSON.parse(JSON.stringify(o));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)],cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const TIME_LIMITS=[0,15,30,60];
const KEY='zhimi-rooms-v5-timer', LEGACY_KEY='zhimi-rooms-v5';let availableStorage=true,loaded=null,lastDraw=null,resizeToken=0;
try{loaded=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||'null');localStorage.setItem(KEY+'-probe','1');localStorage.removeItem(KEY+'-probe')}catch(_){availableStorage=false}
const CATS=[
 {id:'original',name:'Серая',ru:'серая кошка',plural:'серые кошки',bo:'ཞི་མི་སྐྱ་བོ་',src:'cat-gray.webp',heightRatio:1},
 {id:'ginger',name:'Рыжая',ru:'рыжая кошка',plural:'рыжие кошки',bo:'ཞི་མི་ཁམ་པ་',src:'cat-ginger.webp',heightRatio:1},
 {id:'black',name:'Чёрная',ru:'чёрная кошка',plural:'чёрные кошки',bo:'ཞི་མི་ནག་པོ་',src:'cat-black.webp',heightRatio:1},
 {id:'white',name:'Белая',ru:'белая кошка',plural:'белые кошки',bo:'ཞི་མི་དཀར་པོ་',src:'cat-white.webp',heightRatio:1},
 {id:'tabby',name:'Серо-белая',ru:'серо-белая кошка',plural:'серо-белые кошки',bo:'ཞི་མི་སྐྱ་དཀར་ཁྲ་བོ་',src:'cat-gray-white.webp',heightRatio:1},
 {id:'calico',name:'Пёстрая',ru:'пёстрая кошка',plural:'пёстрые кошки',bo:'ཞི་མི་ཁྲ་བོ་',src:'cat-calico.webp',heightRatio:1},
 {id:'siamese',name:'Коричнево-белая',ru:'коричнево-белая кошка',plural:'коричнево-белые кошки',bo:'ཞི་མི་སྨུག་དཀར་ཁྲ་བོ་',src:'cat-brown-white.webp',heightRatio:1}
];
let menuOpen=true,menuDraft=null,menuStep=1;
const prefs={version:5,timerVersion:1,edition:8,room:'bedroom',mode:'learn',cat:'original',labels:false,zoom:true,hideRussian:false,states:{}};
if(loaded&&loaded.version===5){if(ROOMS[loaded.room])prefs.room=loaded.room;if(['learn','A','B','C','M','T'].includes(loaded.mode))prefs.mode=loaded.mode;if(CATS.some(c=>c.id===loaded.cat))prefs.cat=loaded.cat;for(const k of ['labels','zoom','hideRussian'])if(typeof loaded[k]==='boolean')prefs[k]=loaded[k];if(loaded.states&&typeof loaded.states==='object'&&!Array.isArray(loaded.states))prefs.states=loaded.states}
if(!loaded||!loaded.edition||loaded.edition<8)prefs.zoom=true;
const currentCat=()=>CATS.find(c=>c.id===prefs.cat)||CATS[0];
const phraseCount=n=>n+' '+(n%100>=11&&n%100<=14?'фраз':n%10===1?'фраза':n%10>=2&&n%10<=4?'фразы':'фраз');
const questionMode=(r,q=r?.qs[r.i])=>r?.mode==='M'?q?.kind||'A':r?.mode||prefs.mode;
const room=()=>ROOMS[prefs.room];
function allowedFilter(value,rid=prefs.room){return ['focus','all','weak'].includes(value)||ROOMS[rid].allowed.includes(value)}
function state(rid=prefs.room){let s=prefs.states[rid];if(!s||typeof s!=='object'||Array.isArray(s))s=prefs.states[rid]={};
 if(!allowedFilter(s.filter,rid))s.filter='focus';if(![6,12,24].includes(s.length))s.length=12;if(![2,4].includes(s.optionCount))s.optionCount=4;if(!TIME_LIMITS.includes(s.timeLimit))s.timeLimit=0;
 if(!ROOMS[rid].allowed.includes(s.learnC))s.learnC=ROOMS[rid].focus[0];if(!Number.isSafeInteger(s.learnIndex)||s.learnIndex<0)s.learnIndex=0;
 for(const key of ['rounds','best','mastery'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))s[key]={};
 for(const rel of ROOMS[rid].allowed){const v=s.mastery[rel];if(!v||!Number.isSafeInteger(v.seen)||v.seen<0||!Number.isSafeInteger(v.correct)||v.correct<0||v.correct>v.seen||!Number.isSafeInteger(v.solo)||v.solo<0||v.solo>v.correct)s.mastery[rel]={seen:0,correct:0,solo:0}}
 return s}
function recordQuestion(r,q){if(q.chosen===null||q.statsRecorded)return;const v=state(r.room).mastery[q.rel];v.seen++;if(q.ok){v.correct++;if(!q.hint)v.solo++}q.statsRecorded=true}
function weakRelations(rid=prefs.room){const s=state(rid);return ROOMS[rid].allowed.filter(rel=>s.mastery[rel].seen>s.mastery[rel].correct).sort((a,b)=>s.mastery[a].correct/s.mastery[a].seen-s.mastery[b].correct/s.mastery[b].seen)}
function storageLabel(){$('#storageStatus').hidden=availableStorage;$('#storageStatus').textContent=availableStorage?'':'Сохранение недоступно: прогресс останется до закрытия страницы.'}
function save(){if(!availableStorage)return;try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(_){availableStorage=false;storageLabel()}}
function relevantBank(rid=prefs.room){const rm=ROOMS[rid],seen=new Set(),qs=[];for(const sc of rm.scenes)for(let i=0;i<(rm.level===1?R[sc.rel].forms.length:6);i++){const q=sceneQuestion(sc,i,rid);if(!seen.has(q.bo)){seen.add(q.bo);qs.push(q)}}return qs}
function catBank(){return Object.keys(ROOMS).flatMap(relevantBank)}
function npBo(id,col,gen=false){const n=N[id],c=COL[col];return c?n.bo+(gen?c.gen:c.bo):(gen?n.gen:n.bo)}
function npRu(id,col,cs='nom'){const n=N[id],c=COL[col];return (c?(cs==='nom'?c.nom[n.gender]:c.rc[n.gender][cs])+' ':'')+(cs==='nom'?n.ru:n.rc[cs])}
function findScene(id,rel,rid=prefs.room){return ROOMS[rid].scenes.find(s=>s.id===id&&s.rel===rel)}
function sceneQuestion(sc,index=0,rid=prefs.room){const rm=ROOMS[rid],pair=rm.poses[sc.id].length===2,cat=currentCat(),sub=cat.bo+(pair?'གཉིས་':''),subject=pair?'две '+cat.plural:cat.ru;
 const refs=sc.refs.map(id=>({id,...rm.refs[id]}));
 const loc=refs.map((o,i)=>npBo(o.noun,rm.objectColors?o.color:null,i===refs.length-1)).join('དང་');
 const form=R[sc.rel].forms[index%R[sc.rel].forms.length],locFirst=rm.level>1&&index%3===2;
 let place=refs.length===2?'между '+refs.map(o=>npRu(o.noun,rm.objectColors?o.color:null,'ins')).join(' и '):(sc.rel==='out'?'вне':R[sc.rel].pre)+' '+npRu(refs[0].noun,rm.objectColors?refs[0].color:null,R[sc.rel].case);
 place=place.replace(/рядом с с(?=[тн])/g,'рядом со с');
 const q={type:'scene',id:rid+'-'+sc.id+'-'+sc.rel+'-'+index,room:rid,scene:sc.id,rel:sc.rel,index,refs:sc.refs,form,head:locFirst?loc:sub+loc,tail:locFirst?sub+'འདུག':'འདུག',ru:cap(locFirst?place+' — '+subject:subject+' '+place)+'.',words:[{bo:sub,ru:subject,cat:true},...refs.map(o=>({bo:npBo(o.noun,rm.objectColors?o.color:null),ru:npRu(o.noun,rm.objectColors?o.color:null)}))],chosen:null,ok:null,hint:false};q.bo=q.head+q.form+q.tail;return q}
function refreshQuestion(q){const sc=findScene(q.scene,q.rel,q.room);if(!sc)return q;const fresh=sceneQuestion(sc,q.index||0,q.room);for(const k of ['head','tail','ru','words'])q[k]=fresh[k];q.bo=q.head+q.form+q.tail;if(q.kind==='T'&&Array.isArray(q.options))for(const o of q.options){const os=o&&findScene(o.scene,o.rel,q.room);if(os){const f=sceneQuestion(os,o.index||0,q.room);for(const k of ['head','tail','ru'])o[k]=f[k];}}return q}

function refreshAllQuestions(){for(const rid of Object.keys(ROOMS))for(const r of Object.values(state(rid).rounds))if(r?.qs)r.qs.forEach(refreshQuestion)}
function migrateRound(r,mode,rid){if(!r||!Array.isArray(r.qs))return;const rm=ROOMS[rid];r.qs=r.qs.map((q,i)=>{if(!q||!rm.allowed.includes(q.rel))return q;const oldScene=findScene(q.scene,q.rel,rid),legacyRefs=(q.refs||[]).map(v=>typeof v==='string'?v:v.id);const sc=oldScene||rm.scenes.find(sc=>sc.rel===q.rel&&sc.refs.every(id=>legacyRefs.includes(id)))||rm.scenes.filter(sc=>sc.rel===q.rel)[i%rm.scenes.filter(sc=>sc.rel===q.rel).length];if(!sc)return q;const fresh=sceneQuestion(sc,q.index||i,rid);return refreshQuestion({...q,...fresh,...Object.fromEntries(['chosen','ok','hint','options','cands','kind','remainingMs','timeSpentMs','timedOut','timerWarned','statsRecorded'].filter(k=>Object.hasOwn(q,k)).map(k=>[k,q[k]])),form:R[q.rel].forms.includes(q.form)?q.form:fresh.form,kind:mode==='M'?q.kind:mode})});r.contentVersion=7}
function optionsFor(q,rid=prefs.room){const sc=q.type==='scene'?findScene(q.scene,q.rel,rid):null,avoid=new Set([q.rel,...(sc?.amb||[])]);let choices=ROOMS[rid].allowed.filter(x=>!avoid.has(x));
 // Four beginner terms are deliberately kept separate; advanced synonyms never compete.
 if(choices.length<3)choices=Object.keys(R).filter(x=>!avoid.has(x));
 return shuffle([q.rel,...shuffle(choices).slice(0,3)]).map(rel=>({rel,form:rel===q.rel?q.form:pick(R[rel].forms)}))}
function prepare(source,mode,rid=prefs.room,optionCount=state(rid).optionCount){const q=clone(source);q.room=rid;q.kind=mode;q.chosen=null;q.ok=null;q.hint=false;q.timedOut=false;q.timerWarned=false;delete q.remainingMs;delete q.timeSpentMs;delete q.statsRecorded;
 if(mode==='B'){const sc=findScene(q.scene,q.rel,rid);q.cands=shuffle([{id:sc.id,correct:true},...shuffle(sc.decoys).slice(0,optionCount-1).map(id=>({id,correct:false}))]);delete q.options}
 else if(mode==='T'){const bank=relevantBank(rid),relations=shuffle(ROOMS[rid].allowed.filter(rel=>rel!==q.rel)).slice(0,optionCount-1);const choices=[q,...relations.map(rel=>pick(bank.filter(candidate=>candidate.rel===rel)))];q.options=shuffle(choices).map(o=>({rel:o.rel,form:o.form,scene:o.scene,index:o.index,head:o.head,tail:o.tail,ru:o.ru}));delete q.cands;}
 else{const all=optionsFor(q,rid);q.options=shuffle([all.find(o=>o.rel===q.rel),...all.filter(o=>o.rel!==q.rel).slice(0,optionCount-1)]);delete q.cands}return q}
function makeRound(mode,retry=null,rid=prefs.room,retryLimit=null,retryOptions=null){
 const s=state(rid),rm=ROOMS[rid],seconds=retryLimit===null?s.timeLimit:retryLimit,optionCount=retryOptions===null?s.optionCount:retryOptions;
 if(retry)return initialiseTiming({mode,room:rid,filter:s.filter,optionCount,length:retry.length,i:0,retry:true,recorded:false,qs:shuffle(retry).map(q=>prepare(q,mode==='M'?q.kind:mode,rid,optionCount))},seconds);
 let rels=s.filter==='focus'?rm.focus:s.filter==='all'?rm.allowed:s.filter==='weak'?weakRelations(rid):[s.filter];if(!rels.length)rels=rm.focus;
 const sequence=[];while(sequence.length<s.length)sequence.push(...shuffle(rels));
 const used=new Set(),kinds=[];while(kinds.length<s.length)kinds.push(...shuffle(['A','B','C']));
 const qs=sequence.slice(0,s.length).map((rel,i)=>{const kind=mode==='M'?kinds[i]:mode;
  if(kind==='C'||kind==='T'){let p=relevantBank(rid).filter(q=>q.rel===rel),fresh=p.filter(q=>!used.has(q.id));if(fresh.length)p=fresh;const q=pick(p);used.add(q.id);return prepare(q,kind,rid,optionCount)}
  let p=rm.scenes.filter(sc=>sc.rel===rel),fresh=p.filter(sc=>!used.has(sc.id+'/'+sc.rel));if(fresh.length)p=fresh;const sc=pick(p);used.add(sc.id+'/'+sc.rel);return prepare(sceneQuestion(sc,Math.floor(Math.random()*24),rid),kind,rid,optionCount)});
 return initialiseTiming({mode,room:rid,filter:s.filter,optionCount,length:s.length,i:0,retry:false,recorded:false,qs},seconds)}
function validRound(r,m,rid){try{
 if(!r||r.room!==rid||r.mode!==m||!allowedFilter(r.filter,rid)||!Array.isArray(r.qs)||!r.qs.length||r.qs.length>144||!Number.isInteger(r.i)||r.i<0||r.i>r.qs.length)return false;
 const limit=r.timeLimit===undefined?0:r.timeLimit;if(!TIME_LIMITS.includes(limit))return false;
 const count=r.optionCount===undefined?4:r.optionCount;if(![2,4].includes(count))return false;
 return r.qs.every(q=>{
  const kind=m==='M'?q.kind:m;if(!['A','B','C','T'].includes(kind))return false;
  if(!q||!ROOMS[rid].allowed.includes(q.rel)||!['head','tail','form','bo','ru'].every(k=>typeof q[k]==='string')||![null,-1,0,1,2,3].includes(q.chosen)||![null,true,false].includes(q.ok))return false;
  if(q.remainingMs!==undefined&&(!Number.isFinite(q.remainingMs)||q.remainingMs<0||q.remainingMs>limit*1000))return false;
  if(q.timeSpentMs!==undefined&&(!Number.isFinite(q.timeSpentMs)||q.timeSpentMs<0||q.timeSpentMs>limit*1000))return false;
  if(q.type!=='scene'||!findScene(q.scene,q.rel,rid)||!Array.isArray(q.words))return false;
  const a=kind==='B'?q.cands:q.options;if(!Array.isArray(a)||a.length!==count)return false;
  if(kind==='B'){if(a.filter(o=>o.correct).length!==1||!a.every(o=>ROOMS[rid].poses[o.id])||new Set(a.map(o=>o.id)).size!==count)return false}
  else if(a.filter(o=>o.rel===q.rel).length!==1||new Set(a.map(o=>o.rel)).size!==count||!a.every(o=>R[o.rel]&&R[o.rel].forms.includes(o.form)))return false;
  if(kind==='T'&&(!a.every(o=>findScene(o.scene,o.rel,rid)&&Number.isSafeInteger(o.index)&&['head','tail','ru'].every(k=>typeof o[k]==='string'))||new Set(a.map(o=>o.head+o.form+o.tail)).size!==count))return false;
  if(q.chosen===-1)return limit>0&&q.timedOut===true&&q.ok===false&&q.remainingMs===0;
  if(q.timedOut===true)return false;
  return q.chosen===null?q.ok===null:q.chosen<a.length&&q.ok===(kind==='B'?a[q.chosen].correct:a[q.chosen].rel===q.rel);
 });
 }catch(_){return false}}
for(const rid of Object.keys(ROOMS))for(const mode of ['A','B','C','M','T']){const r=state(rid).rounds[mode];migrateRound(r,mode,rid);if(!validRound(r,mode,rid))delete state(rid).rounds[mode];else{restoreTiming(r);r.qs.forEach(q=>recordQuestion(r,q));}}

// -------- Optional per-question timer: pause, resume and preserve saved timing. --------
const clock = { round: null, question: null, last: 0, interval: 0, savedAt: 0 };

function initialiseTiming(r, seconds) {
  r.timeLimit = TIME_LIMITS.includes(seconds) ? seconds : 0;
  r.started = r.timeLimit === 0;
  r.paused = false;
  r.qs.forEach(q => {
    q.timedOut = false;
    q.timerWarned = false;
    q.remainingMs = r.timeLimit * 1000;
    q.timeSpentMs = 0;
  });
  return r;
}
function restoreTiming(r) {
  r.timeLimit = r.timeLimit || 0;
  r.started = r.timeLimit === 0 || r.started === true;
  r.qs.forEach(q => {
    q.timedOut = q.timedOut === true;
    q.timerWarned = q.timerWarned === true;
    q.remainingMs = Number.isFinite(q.remainingMs) ? q.remainingMs : r.timeLimit * 1000;
    q.timeSpentMs = Number.isFinite(q.timeSpentMs) ? q.timeSpentMs : 0;
  });
  // Reopening the file must not use up the learner's remaining time.
  r.paused = !!(r.timeLimit && r.started && r.i < r.qs.length && r.qs[r.i].chosen === null);
}
function timeText(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}
function activeRound() {
  return prefs.mode === 'learn' ? null : state().rounds[prefs.mode] || null;
}
function sampleClock() {
  if (!clock.question) return;
  const now = performance.now();
  clock.question.remainingMs = Math.max(0, clock.question.remainingMs - Math.max(0, now - clock.last));
  clock.last = now;
}
function stopClock() {
  sampleClock();
  if (clock.interval) clearInterval(clock.interval);
  clock.interval = 0;
  clock.round = null;
  clock.question = null;
}
function finishTimeout(r) {
  if (!r || !r.timeLimit || r.i >= r.qs.length) return false;
  const q = r.qs[r.i];
  if (q.chosen !== null) return false;
  if (clock.round === r) stopClock();
  q.remainingMs = 0;
  q.timeSpentMs = r.timeLimit * 1000;
  q.chosen = -1; // A timeout is not a click on one of the four options.
  q.ok = false;
  q.timedOut = true;
  r.paused = false;
  recordQuestion(r,q);
  save();
  if (activeRound() === r) {
    renderGame(true);
    $('#liveStatus').textContent = 'Время вышло. Правильный ответ: ' + (prefs.hideRussian?q.bo:q.ru);
    if (!document.hidden && !$('dialog[open]')) $('#panel [data-action="next"]')?.focus({ preventScroll: true });
  }
  return true;
}
function pauseTimer(refresh = true) {
  const r = clock.round || activeRound();
  stopClock();
  if (!r || !r.timeLimit || !r.started || r.i >= r.qs.length) return;
  const q = r.qs[r.i];
  if (q.chosen !== null) return;
  if (q.remainingMs <= 0) { finishTimeout(r); return; }
  r.paused = true;
  save();
  if (refresh && activeRound() === r) { updateTimer(); updateTimerOverlay(r); }
}
function resumeTimer() {
  if(menuOpen)return;
  const r = activeRound();
  if (!r || !r.timeLimit || r.i >= r.qs.length || document.hidden || $('dialog[open]')) return;
  if (r.qs[r.i].chosen !== null) return;
  r.started = true;
  r.paused = false;
  save();
  syncTimer(r);
  $('#liveStatus').textContent = 'Отсчёт начат. Осталось ' + Math.ceil(r.qs[r.i].remainingMs / 1000) + ' секунд.';
  $('#panel [data-answer]')?.focus({ preventScroll: true });
}
function timerCanAnswer(r) {
  if(menuOpen)return false;
  if (!r.timeLimit) return true;
  if (!r.started || r.paused || document.hidden || $('dialog[open]')) return false;
  sampleClock();
  if (r.qs[r.i].remainingMs <= 0) { finishTimeout(r); return false; }
  return true;
}
function timerHTML(r, q) {
  if (!r.timeLimit) return '';
  return `<section class="question-timer" id="questionTimer" aria-label="Время на вопрос">
    <div class="timer-top"><div class="timer-readout">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 2v3M18 6l2-2" stroke-linecap="round"/></svg>
      <span class="timer-value" id="timerValue" role="timer" aria-live="off">${timeText(q.remainingMs)}</span>
      <span class="timer-label" id="timerLabel">На этот вопрос</span></div>
      <button class="btn subtle timer-pause" data-action="pause-timer" id="timerPause" aria-label="Приостановить отсчёт и скрыть задание">Ⅱ <span>Пауза</span></button></div>
    <div class="timer-track" aria-hidden="true"><span id="timerFill"></span></div>
  </section>`;
}
function updateTimer() {
  const r = activeRound(), q = r?.qs[r.i];
  const widget = $('#questionTimer'), mini = $('#sceneTimer');
  const show = !!(r?.timeLimit && q);
  if (mini) {
    mini.hidden = !show || ['C','T'].includes(questionMode(r,q));
    if (show) { mini.textContent = timeText(q.remainingMs); mini.setAttribute('aria-label', 'Осталось ' + Math.ceil(q.remainingMs / 1000) + ' секунд'); }
  }
  if (!show || !widget) return;
  const answered = q.chosen !== null, paused = !r.started || r.paused;
  const urgent = !answered && !paused && q.remainingMs <= 5000;
  widget.classList.toggle('is-urgent', urgent);
  widget.classList.toggle('is-stopped', answered || paused);
  $('#timerValue').textContent = timeText(q.remainingMs);
  $('#timerValue').setAttribute('aria-label', 'Осталось ' + Math.ceil(q.remainingMs / 1000) + ' секунд');
  $('#timerLabel').textContent = q.timedOut ? 'Время вышло' : answered ? 'Отсчёт остановлен' : !r.started ? 'На каждый вопрос' : r.paused ? 'Пауза' : urgent ? 'Успейте ответить' : 'На этот вопрос';
  $('#timerFill').style.width = Math.max(0, Math.min(100, q.remainingMs / (r.timeLimit * 10))) + '%';
  $('#timerPause').hidden = answered || paused;
  if (mini) mini.classList.toggle('is-urgent', urgent);
}
function updateTimerOverlay(r = activeRound()) {
  const q = r?.qs[r.i];
  const block = !!(r?.timeLimit && q && q.chosen === null && (!r.started || r.paused));
  $('#main').classList.toggle('timer-blocked', block);
  for (const el of [$('.scene-card'), $('#panel')]) {
    el.inert = block;
    if (block) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
  }
  const overlay = $('#timerOverlay');
  overlay.hidden = !block;
  if (!block) return;
  const ready = !r.started;
  $('#timerOverlayTitle').textContent = ready ? 'Раунд на время' : 'Пауза';
  $('#timerOverlayValue').textContent = timeText(q.remainingMs);
  $('#timerOverlayText').textContent = ready
    ? `${r.timeLimit} секунд на каждый вопрос. После ответа можно спокойно прочитать перевод. Если время закончится, вопрос попадёт в повторение.`
    : 'Оставшееся время сохранено. Задание скрыто до продолжения.';
  $('#timerResume').textContent = ready ? 'Начать →' : 'Продолжить →';
}
function tickTimer() {
  const r = clock.round, q = clock.question;
  if (!r || !q) return;
  if (activeRound() !== r || r.qs[r.i] !== q || q.chosen !== null) { stopClock(); return; }
  if (document.hidden || $('dialog[open]')) { pauseTimer(true); return; }
  sampleClock();
  if (q.remainingMs <= 0) { finishTimeout(r); return; }
  updateTimer();
  if (q.remainingMs <= 5000 && !q.timerWarned) {
    q.timerWarned = true;
    $('#liveStatus').textContent = 'Осталось пять секунд на ответ.';
  }
  if (performance.now() - clock.savedAt >= 1000) { clock.savedAt = performance.now(); save(); }
}
function syncTimer(r = activeRound()) {
  if(menuOpen){stopClock();updateTimerOverlay(null);return;}
  const q = r?.qs[r.i];
  if (clock.round && (clock.round !== r || clock.question !== q)) stopClock();
  if (!r?.timeLimit || !q || q.chosen !== null) {
    stopClock(); updateTimer(); updateTimerOverlay(r); return;
  }
  if (document.hidden || $('dialog[open]')) r.paused = r.started;
  if (!r.started || r.paused) { stopClock(); updateTimer(); updateTimerOverlay(r); return; }
  if (q.remainingMs <= 0) { finishTimeout(r); return; }
  if (!clock.interval) {
    clock.round = r; clock.question = q; clock.last = performance.now(); clock.savedAt = clock.last;
    clock.interval = setInterval(tickTimer, 100);
  }
  updateTimer(); updateTimerOverlay(r);
}
function timerResultHTML(r) {
  if (!r.timeLimit) return '<p class="round-timing-caption">Без ограничения времени</p>';
  const elapsed = r.qs.reduce((n, q) => n + (q.timeSpentMs || 0), 0);
  const timedOut = r.qs.filter(q => q.timedOut).length;
  return `<div class="timer-result"><span>${r.timeLimit} с на вопрос</span><span>На ответы: ${timeText(elapsed)}</span><span>Время вышло: ${timedOut}</span></div>`;
}


function configureScene(m){
 $('#main').classList.remove('text-mode','translation-mode');
 $('#sceneHeading').textContent=m==='B'?'Найдите место для кошки':room().title;
}
function bringQuestionIntoView(){if(!menuOpen&&prefs.mode!=='learn'&&matchMedia('(max-width:800px)').matches)$('#main').scrollIntoView({behavior:'instant',block:'start'})}
const MENU_MODES=[
 {id:'learn',title:'Словарик',description:'Изучайте предлоги на картинке'},
 {id:'A',title:'Где кошка?',description:'Выбирайте предлог по картинке'},
 {id:'B',title:'Посади кошку',description:'Находите место по тибетской фразе'},
 {id:'C',title:'Предложения',description:'Вставляйте предлог по русской фразе'},
 {id:'T',title:'С русского на тибетский',description:'Выбирайте полный тибетский перевод'},
 {id:'M',title:'Микс',description:'Чередуйте три вида заданий'}
];
function applyTranslationVisibility(){document.body.classList.toggle('hide-russian',prefs.hideRussian);$('#playHideRussian').checked=prefs.hideRussian;}
function renderCompanion(){applyTranslationVisibility();const c=currentCat();$('#gameCompanion').innerHTML='<img src="'+c.src+'" alt="'+esc(c.name)+' кошка"/><span>'+esc(c.name)+'</span>';$('#sessionSummary').textContent=room().title+' · '+MENU_MODES.find(m=>m.id===prefs.mode).title;}
function menuSettings(rid,mode){const s=state(rid),r=mode==='learn'?null:s.rounds[mode];return r&&r.i<r.qs.length?{filter:r.filter,length:r.retry?s.length:r.length,optionCount:r.optionCount||4,timeLimit:r.timeLimit||0}:{filter:s.filter,length:s.length,optionCount:s.optionCount,timeLimit:s.timeLimit};}
function menuSelection(){return {cat:prefs.cat,room:prefs.room,mode:prefs.mode,hideRussian:prefs.hideRussian,...menuSettings(prefs.room,prefs.mode)};}
function matchingMenuRound(){if(!menuDraft||menuDraft.mode==='learn')return null;const d=menuDraft,s=state(d.room),r=s.rounds[d.mode];return r&&r.i<r.qs.length&&r.filter===d.filter&&(r.retry?d.length===s.length:r.length===d.length)&&(r.optionCount||4)===d.optionCount&&(r.timeLimit||0)===d.timeLimit?r:null;}
function updateStartAction(){const r=matchingMenuRound(),progress=r&&(r.i>0||r.qs.some(q=>q.chosen!==null)||(r.timeLimit&&r.started));$('#startButton').textContent=menuDraft.mode==='learn'?'Открыть словарик':progress?'Продолжить · вопрос '+(r.i+1)+' из '+r.qs.length:'Начать игру';$('#startButton').hidden=menuStep!==3;$('#restartButton').hidden=menuStep!==3||!progress;$('#menuNextButton').hidden=menuStep===3;$('#menuNextButton').textContent=menuStep===2?'Далее: тип игры':'Далее';$('#menuBackButton').hidden=menuStep===1;}
function renderMenuStep(){const titles=['Выберите кошку','Выберите комнату','Выберите тип игры'];$('#startTitle').textContent=titles[menuStep-1];$('#menuStepCount').textContent='Шаг '+menuStep+' из 3';$('#menuCatStep').hidden=menuStep!==1;$('#menuRoomStep').hidden=menuStep!==2;$('#menuModeStep').hidden=menuStep!==3;$('#menuTranslationSetting').hidden=menuStep!==3;renderControls();updateStartAction();}
function setMenuStep(step){if(!menuOpen)return;menuStep=Math.min(3,Math.max(1,step));renderMenuStep();$('#startScreen').scrollIntoView({behavior:'instant',block:'start'});$('#startTitle').focus({preventScroll:true});}

function renderMenu(){
 const d=menuDraft;
 $('#menuCats').innerHTML=CATS.map(c=>`<button class="setup-choice start-cat" data-menu-cat="${c.id}" aria-pressed="${d.cat===c.id}"><img src="${c.src}" alt=""/><span>${esc(c.name)}</span></button>`).join('');
 renderRooms(d.room);
 $('#menuModes').innerHTML=MENU_MODES.map(m=>`<button class="setup-choice start-mode" data-menu-mode="${m.id}" aria-pressed="${d.mode===m.id}"><strong>${m.title}</strong><span>${m.description}</span></button>`).join('');
 renderMenuStep();
}
function openMenu(initial=false){pauseTimer(false);menuOpen=true;menuStep=1;menuDraft=menuSelection();$('#playScreen').hidden=true;$('#startScreen').hidden=false;renderMenu();applyTranslationVisibility();storageLabel();if(!initial){$('#startScreen').scrollIntoView({behavior:'instant',block:'start'});$('#startTitle').focus({preventScroll:true});}$('#liveStatus').textContent=initial?'':'Игра на паузе. Выберите настройки или продолжите раунд.';}
function showPlayScreen(){menuOpen=false;$('#startScreen').hidden=true;$('#playScreen').hidden=false;}
function startGame(forceNew=false){
 if(!menuDraft)return;
 const d=menuDraft,previous=matchingMenuRound();stopClock();
 const catChanged=prefs.cat!==d.cat;prefs.cat=d.cat;prefs.room=d.room;prefs.mode=d.mode;prefs.hideRussian=d.hideRussian;
 const s=state();for(const k of ['filter','length','optionCount','timeLimit'])s[k]=d[k];
 if(catChanged)refreshAllQuestions();
 if(d.mode!=='learn'){
  if(forceNew||!previous)s.rounds[d.mode]=makeRound(d.mode);
  const r=s.rounds[d.mode],q=r.qs[r.i];if(r.timeLimit&&q&&q.chosen===null){r.started=true;r.paused=false;}
 }
 save();showPlayScreen();render(false);$('#playScreen').scrollIntoView({behavior:'instant',block:'start'});$('#liveStatus').textContent=d.mode==='learn'?'Открыт словарик.':'Раунд открыт.';
}
function chooseMenuCat(id){if(!menuOpen||!CATS.some(c=>c.id===id))return;menuDraft.cat=id;$$('[data-menu-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.menuCat===id)));setMenuStep(2);}
function chooseMenuRoom(id){if(!menuOpen||!ROOMS[id])return;if(menuDraft.room!==id){menuDraft.room=id;Object.assign(menuDraft,menuSettings(id,menuDraft.mode));}$$('[data-menu-room]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.menuRoom===id)));updateStartAction();$('#liveStatus').textContent='Выбрана комната «'+ROOMS[id].title+'». Нажмите «Далее: тип игры».';}

function chooseMenuMode(id){if(!menuOpen||!MENU_MODES.some(m=>m.id===id)||menuDraft.mode===id)return;menuDraft.mode=id;const r=state(menuDraft.room).rounds[id];if(r&&r.i<r.qs.length)Object.assign(menuDraft,menuSettings(menuDraft.room,id));$$('[data-menu-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.menuMode===id)));renderControls();updateStartAction();}
function setCat(id){if(!CATS.some(c=>c.id===id))return;if(menuOpen){chooseMenuCat(id);return;}prefs.cat=id;refreshAllQuestions();save();render(false);$('#liveStatus').textContent='Выбрана '+currentCat().ru+'.';}

function renderProgress(){
 const total={seen:0,correct:0,solo:0};Object.keys(ROOMS).forEach(id=>Object.values(state(id).mastery).forEach(v=>{total.seen+=v.seen;total.correct+=v.correct;total.solo+=v.solo}));
 $('#progressBody').innerHTML='<div class="study-totals"><div><strong>'+total.seen+'</strong><span>ответов</span></div><div><strong>'+(total.seen?Math.round(total.correct/total.seen*100)+'%':'—')+'</strong><span>верно</span></div><div><strong>'+total.solo+'</strong><span>без подсказки</span></div></div>'+Object.entries(ROOMS).map(([id,rm])=>{
  const s=state(id),seen=Object.values(s.mastery).reduce((n,v)=>n+v.seen,0);
  return '<section class="room-progress"><h3>'+rm.title+' <small>Уровень '+rm.level+'</small></h3><p>'+(seen?'Ответов: '+seen: 'Можно начать со словарика.')+'</p><div class="topic-progress">'+rm.allowed.map(rel=>{const v=s.mastery[rel],rate=v.seen?Math.round(v.correct/v.seen*100):0;return '<div><span>'+esc(R[rel].ru)+'</span><span class="topic-track"><i style="width:'+rate+'%"></i></span><small>'+(v.seen?v.correct+' / '+v.seen:'ещё не было')+'</small></div>'}).join('')+'</div></section>';
 }).join('')+'<div class="actions"><button class="btn primary" data-action="practice-weak">Потренировать сложное →</button></div>';
}
function practiceWeak(){const rid=weakRelations().length?prefs.room:Object.keys(ROOMS).find(id=>weakRelations(id).length)||prefs.room;$('#progressDialog').close();pauseTimer(false);prefs.room=rid;state().filter=weakRelations(rid).length?'weak':'focus';state().rounds.M=makeRound('M');setMode('M');save();}
function practiceSentence(id){
 const q=catBank().find(x=>x.id===id);if(!q)return;const rid=q.room;
 pauseTimer(false);prefs.room=rid;const s=state();s.filter=q.rel;const r=makeRound('C');r.qs=[prepare(q,'C',rid,r.optionCount),...r.qs.filter(x=>x.id!==q.id)].slice(0,r.length);
 while(r.qs.length<r.length)r.qs.push(prepare(q,'C',rid,r.optionCount));initialiseTiming(r,r.timeLimit);s.rounds.C=r;$('#bankDialog').close();setMode('C');save();
}
function showExample(id){const q=catBank().find(x=>x.id===id);if(!q)return;pauseTimer(false);prefs.room=q.room;const s=state();s.learnC=q.rel;const pool=room().scenes.filter(sc=>sc.rel===q.rel),i=pool.findIndex(sc=>sc.id===q.scene);s.learnIndex=Math.max(0,i);$('#bankDialog').close();setMode('learn');save();$('#main').scrollIntoView({behavior:'instant',block:'start'})}

// -------- Graphics: one immutable painting per room, independent cat and occlusion layers. --------
function poseBounds(p){return [p.x-p.width*.52,p.y-p.width*currentCat().heightRatio-6,p.x+p.width*.52,p.y+6]}
function viewBox(o){const rm=room();if(!prefs.zoom)return [0,0,rm.width,rm.height];
 let boxes=(o.refs||[]).filter(id=>id!=='room').map(id=>rm.refs[id]?.bounds).filter(Boolean);let poses=o.cands?o.cands.flatMap(c=>rm.poses[c.id]):rm.poses[o.id]||[];
 if(o.id==='out_room'&&!o.cands)boxes=[rm.refs.door?.bounds||[rm.width*.78,rm.height*.2,rm.width,rm.height*.85]];
 boxes=boxes.concat(poses.map(poseBounds));if(!boxes.length)return[0,0,rm.width,rm.height];
 let x1=Math.min(...boxes.map(b=>b[0]))-38,y1=Math.min(...boxes.map(b=>b[1]))-28,x2=Math.max(...boxes.map(b=>b[2]))+38,y2=Math.max(...boxes.map(b=>b[3]))+28;
 const ratio=matchMedia('(max-width:800px)').matches?1.3:1.65;let w=Math.max(rm.width*.46,x2-x1),h=Math.max(rm.height*.5,y2-y1);if(w/h>ratio)h=w/ratio;else w=h*ratio;
 if(w>rm.width){h*=rm.width/w;w=rm.width}if(h>rm.height){w*=rm.height/h;h=rm.height}
 return [Math.max(0,Math.min(rm.width-w,(x1+x2-w)/2)),Math.max(0,Math.min(rm.height-h,(y1+y2-h)/2)),w,h]}
let catMaskSerial=0;
function catSVG(p,animate,rid=prefs.room,staticImage=false){const rm=ROOMS[rid],h=p.width*currentCat().heightRatio,flip=p.flip?-1:1;const shadow=`<ellipse cx="${p.x+3}" cy="${p.y-1}" rx="${p.width*.33}" ry="${p.width*.045}" fill="#27170c" opacity=".3"/>`;
 const cat=`${shadow}<g transform="translate(${p.x} ${p.y}) scale(${flip} 1)"><g class="${animate?'appear':''}"><g class="${staticImage?'':'cat-idle'}"><image href="${currentCat().src}" x="${-p.width/2}" y="${-h}" width="${p.width}" height="${h}" preserveAspectRatio="xMidYMax meet"/></g></g></g>`;
 const foreground=(p.mask||[]).map(id=>rm.occluders[id]).filter(Boolean);if(!foreground.length)return cat;
 const id='cat-occlusion-'+(++catMaskSerial),filter=id+'-black';
 // Mask this cat only. Repainting furniture here could cover a different candidate cat.
 return `<defs><filter id="${filter}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${rm.width}" height="${rm.height}" style="mask-type:luminance"><rect width="${rm.width}" height="${rm.height}" fill="white"/>${foreground.map(a=>{const b=a.box;return `<image href="${a.uri}" x="${b[0]}" y="${b[1]}" width="${b[2]-b[0]}" height="${b[3]-b[1]}" filter="url(#${filter})"/>`;}).join('')}</mask></defs><g mask="url(#${id})">${cat}</g>`;
}

function markerLayout(o,vb){const rm=room(),screen=$('#scene').clientWidth||800;const r=Math.max(26,Math.min(62,vb[2]/screen*18));
 const points=o.cands.flatMap((cd,k)=>rm.poses[cd.id].map((p,j)=>{const offset=r+p.width*.55+12,side=p.x+offset>vb[0]+vb[2]-r?-1:1;return {k,j,x:p.x+side*offset,y:p.y-p.width*.43,ax:p.x,ay:p.y-p.width*.43}}));
 for(let z=0;z<35;z++)for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),gap=2*r+7;if(d<gap){const ux=d>.1?dx/d:1,uy=d>.1?dy/d:0,t=(gap-d)/2+.1;a.x-=ux*t;a.y-=uy*t;b.x+=ux*t;b.y+=uy*t}for(const p of [a,b]){p.x=Math.max(vb[0]+r+2,Math.min(vb[0]+vb[2]-r-2,p.x));p.y=Math.max(vb[1]+r+2,Math.min(vb[1]+vb[3]-r-2,p.y))}}
 return {r,points}}
function markerSVG(o,vb){const {r,points}=markerLayout(o,vb),answered=Number.isInteger(o.chosen);
 return o.cands.map((cd,k)=>{if(answered&&(k!==o.chosen||cd.correct))return'';const pts=points.filter(p=>p.k===k);const links=pts.length>1?`<path d="M${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y}" stroke="#f1cb83" stroke-width="3" opacity=".85"/>`:'';
 return `<g class="spot ${answered?'wrong':''}" ${answered?'aria-hidden="true"':`tabindex="0" role="button" aria-label="Место ${k+1}"`} data-spot="${k}">${links}${pts.map(p=>`${Math.hypot(p.x-p.ax,p.y-p.ay)>r*.5?`<path d="M${p.ax},${p.ay}L${p.x},${p.y}" stroke="#ffe2a2" stroke-width="2"/><circle cx="${p.ax}" cy="${p.ay}" r="4" fill="#ffe2a2"/>`:''}<circle cx="${p.x}" cy="${p.y}" r="${r}"/><text x="${p.x}" y="${p.y}" style="font-size:${r*.96}px">${answered?'×':k+1}</text>`).join('')}</g>`}).join('')}
function labelsSVG(){const rm=room();return Object.entries(rm.refs).filter(([id])=>id!=='room'&&id!=='rug').map(([id,v])=>{const [x,y]=v.tag;return `<text class="scene-label" x="${x}" y="${Math.max(35,y)}" text-anchor="middle" lang="bo">${N[v.noun].bo}</text>`}).join('')}
function draw(o){lastDraw={...o};const rm=room(),vb=viewBox(o),cs=o.show===false?[]:rm.poses[o.id]||[];
 const svg=$('#scene');svg.setAttribute('viewBox',vb.join(' '));svg.setAttribute('role',o.cands&&o.chosen===null?'group':'img');svg.setAttribute('aria-label',o.cands&&o.chosen===null?'Комната. Выберите одно из '+o.cands.length+' пронумерованных мест.':o.alt||'Комната с кошкой.');
 svg.innerHTML=`<image href="${rm.image}" x="0" y="0" width="${rm.width}" height="${rm.height}"/>`+cs.map(p=>catSVG(p,o.animate)).join('')+(o.cands&&o.chosen===null?`<g class="cat-previews">${o.cands.flatMap(cd=>rm.poses[cd.id]).sort((a,b)=>a.y-b.y).map(p=>catSVG(p,false,prefs.room,true)).join('')}</g>`:'')+(prefs.labels?labelsSVG():'')+(o.cands?markerSVG(o,vb):'');
 $('.scene-wrap').style.aspectRatio=String(vb[2]/vb[3]);$('#labelsBtn').setAttribute('aria-pressed',String(prefs.labels));$('#zoomBtn').setAttribute('aria-pressed',String(prefs.zoom));$('#zoomBtn').setAttribute('aria-label',prefs.zoom?'Показать всю комнату':'Приблизить место задания');
}

// -------- Interface and existing exercise mechanics --------
function sentenceHTML(q,answered){return `<p class="sentence bo" lang="bo">${esc(q.head)}${answered?`<mark>${esc(q.form)}</mark>`:'<span class="blank" aria-label="пропущенный предлог">?</span>'}${esc(q.tail)}</p>`}
function progressHTML(r){if(!r)return '';const solved=r.qs.filter(q=>q.chosen!==null).length,ok=r.qs.filter(q=>q.ok).length;
 return `<div class="progress"><div class="progress-meta"><span>${r.i<r.qs.length?'Вопрос '+(r.i+1)+' из '+r.qs.length:'Раунд завершён'}</span><span>Верно: ${ok} · Пройдено: ${solved}</span></div><div class="bars" aria-hidden="true">${r.qs.map((q,i)=>`<span class="bar ${q.ok===true?(q.hint?'help':'ok'):q.ok===false?'bad':i===r.i?'now':''}"></span>`).join('')}</div></div>`}
function currentLearn(){const s=state(),pool=room().scenes.filter(sc=>sc.rel===s.learnC);return sceneQuestion(pool[s.learnIndex%pool.length],s.learnIndex)}
const ROOM_MENU_DETAILS={
 bedroom:{difficulty:'Легко',description:'Короткие фразы об одном предмете.'},
 tea:{difficulty:'Сложнее',description:'Добавляются цвета предметов.'},
 library:{difficulty:'Сложно',description:'Есть фразы с двумя предметами или двумя кошками.'}
};
function renderRooms(selected=prefs.room){$('#roomPicker').innerHTML=Object.entries(ROOMS).map(([id,rm])=>{const info=ROOM_MENU_DETAILS[id],topics=(rm.level>1?'Новые: ':'')+cap(rm.focus.map(rel=>R[rel].ru).join(', '));return `<button class="setup-choice room-choice start-room" data-menu-room="${id}" aria-pressed="${selected===id}" aria-label="${esc(rm.title)}. Уровень ${rm.level}. ${info.difficulty}. ${esc(topics)}. ${info.description}"><img src="${rm.thumbnail}" alt=""/><span class="room-copy"><span class="room-level-line"><span class="room-level">Уровень ${rm.level} · ${info.difficulty}</span><span class="room-selected" aria-hidden="true">✓ Выбрана</span></span><strong>${esc(rm.title)}</strong><span class="room-topics">${esc(topics)}</span><small class="room-description">Всего ${rm.allowed.length} ${rm.allowed.length===4?'предлога':'предлогов'}. ${info.description}</small></span></button>`;}).join('')}


function filterHTML(rid=prefs.room){const rm=ROOMS[rid],focus=rm.level===1?'Все '+rm.allowed.length+' предлога':'Новые: '+rm.focus.map(rel=>R[rel].ru).join(', ');return `<option value="focus">${focus}</option>${rm.level>1?'<option value="all">Все '+rm.allowed.length+' предлогов</option>':''}`+'<option value="weak">Мои ошибки</option>'+rm.allowed.map(rel=>`<option value="${rel}">Только «${R[rel].ru}»</option>`).join('')}
function renderMenuRelationHelp(){const d=menuDraft;if(!d)return;const rm=ROOMS[d.room];let rels=d.filter==='focus'?rm.focus:d.filter==='all'?rm.allowed:d.filter==='weak'?weakRelations(d.room):[d.filter];const fallback=!rels.length;if(fallback)rels=rm.focus;$('#menuRelationHelp').textContent=(fallback?'Ошибок пока нет. В раунде: ':'В раунде: ')+rels.map(rel=>R[rel].ru).join(', ')+'.';}
function renderControls(){
 const d=menuOpen&&menuDraft?menuDraft:menuSelection();
 $('#menuModeHelp').textContent=MENU_MODES.find(m=>m.id===d.mode).description;$('#menuPracticeSettings').hidden=menuStep!==3||d.mode==='learn';renderMenuRelationHelp();$('#menuHideRussian').checked=d.hideRussian??prefs.hideRussian;
 $('#relationFilter').innerHTML=filterHTML(d.room);$('#relationFilter').value=d.filter;$('#roundLength').value=String(d.length);$('#timerSelect').value=String(d.timeLimit);$('#optionCount').value=String(d.optionCount);
}

function renderDictionary(){const on=prefs.mode==='learn';$('#dictionary').hidden=!on;if(!on)return;const s=state();$('#dictionary').innerHTML=`<details class="relation-picker"><summary><span class="learn-current">${bo(R[s.learnC].forms[0])}<span>${R[s.learnC].ru}</span></span><span class="learn-change">Выбрать предлог <span aria-hidden="true">⌄</span></span></summary><p class="learn-instruction">Нажмите на предлог — кошка покажет его значение.</p><div class="tiles">${room().allowed.map(rel=>`<button class="tile" data-rel="${rel}" aria-pressed="${s.learnC===rel}">${bo(R[rel].forms[0])}<span class="t-ru">${R[rel].ru}</span>${room().level>1&&room().focus.includes(rel)?'<span class="new-dot" title="Новый предлог уровня"></span>':''}</button>`).join('')}</div></details>`}
function pictureHTML(q){const rm=ROOMS[q.room];return `<svg class="example-picture" viewBox="0 0 ${rm.width} ${rm.height}" role="img" aria-label="${esc(q.ru)}"><image href="${rm.thumbnail}" width="${rm.width}" height="${rm.height}"/>${rm.poses[q.scene].map(p=>catSVG(p,false,q.room,true)).join('')}</svg>`}
function exampleCard(q,i,bank=false){return `<article class="example-card illustrated-example">${pictureHTML(q)}<div class="example-copy"><p class="example-index">${esc(ROOMS[q.room].title)} · ${R[q.rel].ru}</p><p class="ex-bo bo" lang="bo">${esc(q.head)}<mark>${esc(q.form)}</mark>${esc(q.tail)}</p><p class="ru">${esc(q.ru)}</p><div class="example-actions"><button class="text-link" data-example-id="${q.id}">Показать в комнате</button><button class="btn subtle" data-practice-id="${q.id}">Тренировать →</button></div></div></article>`}
function renderExamples(){$('#examples').hidden=prefs.mode!=='learn';$('#examples').innerHTML=prefs.mode==='learn'?`<button class="text-link" data-action="open-bank">Все примеры с картинками · ${catBank().length}</button>`:''}
function renderLearn(animate=false){$('#main').classList.remove('translation-mode');stopClock();updateTimerOverlay(null);$('#sceneTimer').hidden=true;const q=currentLearn(),r=R[q.rel];draw({id:q.scene,refs:q.refs,animate,alt:prefs.hideRussian?'Кошка в комнате.':q.ru});$('#panel').innerHTML=`<div class="entry-heading">${bo(q.form)}<span class="entry-ru">${r.ru}</span></div>${r.forms.length>1?`<p class="variants bo" lang="bo">${r.forms.filter(f=>f!==q.form).map(esc).join(' · ')}</p>`:''}`+sentenceHTML(q,true)+`<p class="ru">${esc(q.ru)}</p>${wordsHTML(q)}${q.rel==='both'?'<p class="meaning-note">В этих заданиях «по обе стороны» показывают две кошки.</p>':''}${['left','right'].includes(q.rel)?'<p class="meaning-note">Слева и справа — со стороны зрителя.</p>':''}<div class="actions"><button class="btn" data-action="next-example">Другой пример ↻</button><button class="btn primary" data-action="practice-current">Потренироваться →</button></div>`+progressHTML();renderDictionary();renderExamples()}
function wordsHTML(q){return `<details class="sentence-words"><summary>Слова в предложении</summary><dl>${q.words.map(w=>`<div><dt>${w.cat?'<img src="'+currentCat().src+'" alt=""/>':''}${bo(w.bo)}</dt><dd>${esc(w.ru)}</dd></div>`).join('')}</dl><p>${q.kind==='T'?'Выберите полный перевод русского предложения.':'Нужно выбрать только предлог — слово, которое показывает положение кошки.'}</p></details>`}
function instructionHTML(m){return `<p class="mode-instruction">${m==='T'?'Выберите перевод на тибетский.':m==='B'?'Прочитайте фразу и нажмите нужный номер в комнате.':m==='C'?'Выберите подходящий предлог.':'Посмотрите на кошку и выберите подходящий предлог'}</p>`}
function renderGame(animate=false){
 const s=state();let r=s.rounds[prefs.mode];if(!r){r=s.rounds[prefs.mode]=makeRound(prefs.mode);save();}
 if(r.i>=r.qs.length){renderEnd(r);return;}
 const q=r.qs[r.i],answered=q.chosen!==null,m=questionMode(r,q),translation=m==='C'||m==='T';
 configureScene(m);$('#main').classList.toggle('translation-mode',m==='T');let h=timerHTML(r,q);
 draw({id:q.scene,refs:q.refs,show:m!=='B'||answered,cands:m==='B'?q.cands:null,chosen:q.chosen,animate,alt:m==='T'||((m==='C'||answered||q.hint)&&!prefs.hideRussian)?q.ru:cap(currentCat().ru)+'. Определите её положение.'});
 h+=instructionHTML(m)+(translation?`<p class="translation-prompt ${m==='C'?'ru':''}">${esc(q.ru)}</p>`:'')+(m==='T'&&!answered?'':sentenceHTML(q,answered||m==='B'))+wordsHTML(q);
 if(m==='B')h+=`<div class="numbers" role="group" aria-label="Варианты мест">${q.cands.map((o,i)=>`<button class="place-number ${answered?(o.correct?'ok':q.chosen===i?'bad':''):''}" data-answer="${i}" ${answered?'disabled':''} aria-label="Место ${i+1}">${i+1}</button>`).join('')}</div>`;
 else h+=`<div class="options ${m==='T'?'translation-options':''}" role="group" aria-label="${m==='T'?'Варианты перевода':'Варианты предлогов'}">${q.options.map((o,i)=>`<button class="option ${answered?(o.rel===q.rel?'ok':q.chosen===i?'bad':'dim'):''}" data-answer="${i}" ${answered?'disabled':''}><span class="number" aria-hidden="true">${i+1}</span>${bo(m==='T'?o.head+o.form+o.tail:o.form)}${answered?`<span class="opt-ru">${o.rel===q.rel?'✓ ':q.chosen===i?'× ':''}${esc(m==='T'?o.ru:R[o.rel].ru)}</span>`:''}</button>`).join('')}</div>`;
 if(answered){
  const correct=m==='T'?'Правильный перевод: '+bo(q.bo)+'.':'Правильно: '+bo(q.form)+'<span class="ru-meaning"> — '+esc(R[q.rel].ru)+'</span>.';
  const feedback=q.timedOut?(m==='B'?'Время вышло. Верное место — '+(q.cands.findIndex(c=>c.correct)+1)+'. Кошка показывает его.':'Время вышло. '+correct):q.ok?'✓ Верно'+(q.hint?' — с подсказкой.':'!'):m==='B'?'Не то место. Кошка показывает правильный ответ.':correct;
  h+=`<p class="feedback ${q.ok?'good':'bad'}">${feedback}</p>${!translation?`<p class="ru">${esc(q.ru)}</p>`:''}<div class="actions"><button class="btn primary" data-action="next">${r.i===r.qs.length-1?'Посмотреть результат':'Следующее задание'} →</button></div>`;
 }else if(!translation&&!prefs.hideRussian)h+=q.hint?`<div class="hint-line"><p class="ru">${esc(q.ru)}</p><p class="small-note">Этот ответ учитывается как ответ с подсказкой.</p></div>`:'<div class="actions"><button class="btn" data-action="hint">Показать перевод</button></div>';
 $('#panel').innerHTML=h+progressHTML(r);renderDictionary();renderExamples();renderControls();renderCompanion();syncTimer(r);
}

function recordKey(r){return r.mode+'-'+r.filter+'-'+r.length+(r.timeLimit?'-t'+r.timeLimit:'')+((r.optionCount||4)===2?'-a2':'')}
function renderEnd(r){configureScene('A');stopClock();updateTimerOverlay(null);$('#sceneTimer').hidden=true;const ok=r.qs.filter(q=>q.ok),solo=ok.filter(q=>!q.hint).length,wrong=r.qs.filter(q=>!q.ok),help=r.qs.filter(q=>q.hint).length,s=state(),key=recordKey(r);
 if(!r.recorded){if(!r.retry)s.best[key]=Math.max(+s.best[key]||0,solo);r.recorded=true;save();renderRooms()}
 draw({id:prefs.room==='bedroom'?'on_bed':'on_chair',refs:[],animate:false,alt:cap(currentCat().ru)+'. Раунд завершён.'});
 $('#panel').innerHTML=`<h2 class="result-title">Раунд завершён</h2>${timerResultHTML(r)}<p class="score"><strong>${ok.length}</strong> / ${r.qs.length}</p><p class="result-caption">${solo} верно без подсказки.${help?' Подсказка использована в '+help+' заданиях.':''}</p>${!r.retry?`<p class="small-note">Лучший результат в этой комнате ${r.timeLimit?'с таймером '+r.timeLimit+' с':'без таймера'}: ${s.best[key]||0} / ${r.qs.length} без подсказок.</p>`:''}${wrong.length?`<ul class="mistakes">${wrong.map(q=>`<li>${bo(q.bo)}<p class="ru">${esc(q.ru)}</p>${q.timedOut?'<span class="timeout-tag">Время вышло</span>':''}</li>`).join('')}</ul>`:'<p class="meaning-note">Ни одной ошибки. Отличная работа!</p>'}<div class="actions">${wrong.length?'<button class="btn primary" data-action="repeat-wrong">Повторить ошибки</button>':''}<button class="btn ${wrong.length?'':'primary'}" data-action="new-round">Ещё раунд ↻</button><button class="btn" data-action="learn">Словарик</button></div>`+progressHTML(r);renderDictionary();renderExamples();renderControls()}
function render(animate=false){renderCompanion();$('#main').classList.toggle('is-practice',prefs.mode!=='learn');
 $('#sceneHeading').textContent=prefs.mode==='B'?'Найдите место для кошки':room().title;
 if(prefs.mode==='learn')renderLearn(animate);else renderGame(animate);renderControls();storageLabel()}

function setRoom(id){if(!ROOMS[id])return;if(id!==prefs.room)pauseTimer(false);prefs.room=id;save();render(false);$('#liveStatus').textContent='Открыта комната «'+room().title+'», уровень '+room().level+'.'}
function setMode(m){if(!['learn','A','B','C','M','T'].includes(m))return;if(m!==prefs.mode)pauseTimer(false);prefs.mode=m;save();showPlayScreen();render(false);bringQuestionIntoView()}
function newRound(){if(prefs.mode==='learn')return;stopClock();state().rounds[prefs.mode]=makeRound(prefs.mode);save();render(true);bringQuestionIntoView();$('#liveStatus').textContent='Начат новый раунд.'}
function answer(i){
 if(menuOpen||prefs.mode==='learn'||!Number.isInteger(i)||i<0)return;
 const r=state().rounds[prefs.mode];if(!r||r.i>=r.qs.length)return;
 const q=r.qs[r.i],opts=questionMode(r,q)==='B'?q.cands:q.options;
 if(q.chosen!==null||i>=opts.length||!timerCanAnswer(r))return;
 stopClock();
 if(r.timeLimit&&q.remainingMs<=0){finishTimeout(r);return}
 q.chosen=i;q.ok=questionMode(r,q)==='B'?opts[i].correct:opts[i].rel===q.rel;
 q.timedOut=false;q.timeSpentMs=r.timeLimit?r.timeLimit*1000-q.remainingMs:0;
 recordQuestion(r,q);save();renderGame(true);$('#liveStatus').textContent=(q.ok?'Верно. ':'Правильный ответ: ')+(prefs.hideRussian?q.bo:q.ru);
 $('#panel [data-action="next"]')?.focus({preventScroll:true});
}
function renderBank(){const all=catBank(),needle=$('#bankSearch').value.trim().toLocaleLowerCase('ru'),rel=$('#bankRel').value,rid=$('#bankLevel').value;const base=rid==='all'?all:relevantBank(rid);const qs=base.filter(q=>(rel==='all'||q.rel===rel)&&(!needle||[q.ru,q.bo].some(t=>t.toLocaleLowerCase('ru').includes(needle))));$('#bankCount').textContent=`Найдено: ${phraseCount(qs.length)}.`;$('#bankGrid').innerHTML=qs.length?qs.map((q,i)=>exampleCard(q,i,true)).join(''):'<p class="empty">Таких фраз не нашлось. Попробуйте другое слово.</p>';$('#bankTitle').textContent='Примеры с картинками';$('#bankLevel option[value="all"]').textContent='Все комнаты · '+phraseCount(all.length)}
function openBank(){pauseTimer(true);$('#bankSearch').value='';$('#bankRel').value='all';$('#bankLevel').value=prefs.room;renderBank();$('#bankDialog').showModal();$('#bankSearch').focus()}
function action(act){const s=state(),r=s.rounds[prefs.mode];
 if(act==='open-menu'){openMenu();return;}
 else if(act==='menu-next'){setMenuStep(menuStep+1);return;}
 else if(act==='menu-back'){setMenuStep(menuStep-1);return;}
 else if(act==='start-game'){startGame();return;}
 else if(act==='restart-game'){startGame(true);return;}
 else if(act==='pause-timer'){pauseTimer(true);$('#timerResume')?.focus({preventScroll:true});$('#liveStatus').textContent='Пауза. Оставшееся время сохранено.'}
 else if(act==='resume-timer')resumeTimer();
 else if(act==='next-example'){s.learnIndex++;save();renderLearn(true)}
 else if(act==='practice-current'){s.filter=s.learnC;s.rounds.A=makeRound('A');setMode('A')}
 else if(act==='new-round')newRound();
 else if(act==='hint'){if(!prefs.hideRussian&&r&&r.i<r.qs.length&&r.qs[r.i].chosen===null&&timerCanAnswer(r)){r.qs[r.i].hint=true;save();renderGame(false);$('#liveStatus').textContent=r.qs[r.i].ru}}
 else if(act==='next'){if(r&&r.i<r.qs.length&&r.qs[r.i].chosen!==null){stopClock();r.paused=false;r.i++;save();renderGame(true);($('#panel [data-answer]')||$('#panel [data-action="repeat-wrong"]')||$('#panel [data-action="new-round"]'))?.focus({preventScroll:true})}}
 else if(act==='repeat-wrong'){if(r){const wrong=r.qs.filter(q=>q.ok===false);if(wrong.length){stopClock();s.rounds[prefs.mode]=makeRound(prefs.mode,wrong,prefs.room,r.timeLimit,r.optionCount||4);s.rounds[prefs.mode].filter=r.filter;save();renderGame(true)}}}
 else if(act==='open-progress'){pauseTimer(true);renderProgress();$('#progressDialog').showModal()}else if(act==='close-progress')$('#progressDialog').close();else if(act==='practice-weak')practiceWeak();else if(act==='learn')setMode('learn');else if(act==='open-bank')openBank();else if(act==='close-bank')$('#bankDialog').close();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.menuCat)return chooseMenuCat(b.dataset.menuCat);if(b.dataset.menuRoom)return chooseMenuRoom(b.dataset.menuRoom);if(b.dataset.menuMode)return chooseMenuMode(b.dataset.menuMode);if(b.dataset.cat)return setCat(b.dataset.cat);if(b.dataset.room)return setRoom(b.dataset.room);if(b.dataset.mode)return setMode(b.dataset.mode);if(b.dataset.rel){state().learnC=b.dataset.rel;state().learnIndex=0;save();renderLearn(true);return}if(b.dataset.answer!==undefined)return answer(+b.dataset.answer);if(b.dataset.practiceId){practiceSentence(b.dataset.practiceId);return}if(b.dataset.exampleId){showExample(b.dataset.exampleId);return}if(b.dataset.action)action(b.dataset.action)});
$('#menuHideRussian').addEventListener('change',e=>{if(menuOpen&&menuDraft)menuDraft.hideRussian=e.target.checked;});
$('#playHideRussian').addEventListener('change',e=>{prefs.hideRussian=e.target.checked;save();render(false);});
$('#labelsBtn').addEventListener('click',()=>{prefs.labels=!prefs.labels;save();if(lastDraw)draw({...lastDraw,animate:false})});$('#zoomBtn').addEventListener('click',()=>{prefs.zoom=!prefs.zoom;save();if(lastDraw)draw({...lastDraw,animate:false})});
for(const [id,key,allowed] of [['relationFilter','filter',null],['roundLength','length',[6,12,24]],['optionCount','optionCount',[2,4]],['timerSelect','timeLimit',TIME_LIMITS]])$('#'+id).addEventListener('change',e=>{if(!menuOpen||!menuDraft)return;const value=allowed?Number(e.target.value):e.target.value;if(allowed?!allowed.includes(value):!allowedFilter(value,menuDraft.room))return;menuDraft[key]=value;renderMenuRelationHelp();updateStartAction();});
$('#scene').addEventListener('click',e=>{const el=e.target.closest('[data-spot]');if(el&&!el.classList.contains('wrong'))answer(+el.dataset.spot)});
$('#scene').addEventListener('keydown',e=>{const el=e.target.closest('[data-spot]');if(el&&['Enter',' '].includes(e.key)){e.preventDefault();answer(+el.dataset.spot)}});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||menuOpen||prefs.mode==='learn'||$('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable]'))return;if(/^[1-4]$/.test(e.key)){e.preventDefault();answer(+e.key-1)}});
$('#bankSearch').addEventListener('input',renderBank);$('#bankRel').addEventListener('change',renderBank);$('#bankLevel').addEventListener('change',renderBank);
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeToken);resizeToken=requestAnimationFrame(()=>{if(!menuOpen&&lastDraw&&!$('#main').classList.contains('text-mode'))draw({...lastDraw,animate:false})})});
$('#bankRel').innerHTML='<option value="all">Все предлоги</option>'+Object.keys(R).map(k=>`<option value="${k}">${R[k].ru}</option>`).join('');
window.__ZHIMI={version:'8.1',pauseTimer,resumeTimer,syncTimer,tickTimer,recordKey,prefs,ROOMS,R,catBank,makeRound,prepare,questionMode,CATS,currentCat,recordQuestion,weakRelations,setCat,practiceSentence,sceneQuestion,draw,answer,action,render,mode:setMode,setRoom,state,validRound,relevantBank,
 qa:()=>({version:'8.1',timeLimits:TIME_LIMITS,rooms:Object.keys(ROOMS).length,sentences:catBank().length,uniqueSentences:new Set(catBank().map(q=>q.bo)).size,scenes:Object.fromEntries(Object.entries(ROOMS).map(([id,r])=>[id,r.scenes.length])),levelBankCounts:Object.fromEntries(Object.keys(ROOMS).map(id=>[id,relevantBank(id).length]))})};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseTimer(true);else if(!menuOpen&&prefs.mode!=='learn'){updateTimer();updateTimerOverlay();}});
window.addEventListener('pagehide',()=>{pauseTimer(false);save();});
window.addEventListener('pageshow',e=>{if(e.persisted){if(prefs.mode!=='learn')syncTimer();else updateTimerOverlay(null);}});
openMenu(true);save();
})();
