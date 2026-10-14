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
const prefs={version:5,timerVersion:1,edition:7,room:'bedroom',mode:'learn',cat:'original',labels:false,zoom:false,states:{}};
if(loaded&&loaded.version===5){if(ROOMS[loaded.room])prefs.room=loaded.room;if(['learn','A','B','C','M'].includes(loaded.mode))prefs.mode=loaded.mode;if(CATS.some(c=>c.id===loaded.cat))prefs.cat=loaded.cat;for(const k of ['labels','zoom'])if(typeof loaded[k]==='boolean')prefs[k]=loaded[k];if(loaded.states&&typeof loaded.states==='object'&&!Array.isArray(loaded.states))prefs.states=loaded.states}
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
function storageLabel(){$('#storageStatus').textContent=availableStorage?'Прогресс сохраняется отдельно для каждой комнаты.':'Сохранение недоступно: прогресс останется до закрытия страницы.'}
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
function refreshQuestion(q){const sc=findScene(q.scene,q.rel,q.room);if(!sc)return q;const fresh=sceneQuestion(sc,q.index||0,q.room);for(const k of ['head','tail','ru','words'])q[k]=fresh[k];q.bo=q.head+q.form+q.tail;return q}
function refreshAllQuestions(){for(const rid of Object.keys(ROOMS))for(const r of Object.values(state(rid).rounds))if(r?.qs)r.qs.forEach(refreshQuestion)}
function migrateRound(r,mode,rid){if(!r||!Array.isArray(r.qs))return;const rm=ROOMS[rid];r.qs=r.qs.map((q,i)=>{if(!q||!rm.allowed.includes(q.rel))return q;const oldScene=findScene(q.scene,q.rel,rid),legacyRefs=(q.refs||[]).map(v=>typeof v==='string'?v:v.id);const sc=oldScene||rm.scenes.find(sc=>sc.rel===q.rel&&sc.refs.every(id=>legacyRefs.includes(id)))||rm.scenes.filter(sc=>sc.rel===q.rel)[i%rm.scenes.filter(sc=>sc.rel===q.rel).length];if(!sc)return q;const fresh=sceneQuestion(sc,q.index||i,rid);return refreshQuestion({...q,...fresh,...Object.fromEntries(['chosen','ok','hint','options','cands','kind','remainingMs','timeSpentMs','timedOut','timerWarned','statsRecorded'].filter(k=>Object.hasOwn(q,k)).map(k=>[k,q[k]])),form:R[q.rel].forms.includes(q.form)?q.form:fresh.form,kind:mode==='M'?q.kind:mode})});r.contentVersion=7}
function optionsFor(q,rid=prefs.room){const sc=q.type==='scene'?findScene(q.scene,q.rel,rid):null,avoid=new Set([q.rel,...(sc?.amb||[])]);let choices=ROOMS[rid].allowed.filter(x=>!avoid.has(x));
 // Four beginner terms are deliberately kept separate; advanced synonyms never compete.
 if(choices.length<3)choices=Object.keys(R).filter(x=>!avoid.has(x));
 return shuffle([q.rel,...shuffle(choices).slice(0,3)]).map(rel=>({rel,form:rel===q.rel?q.form:pick(R[rel].forms)}))}
function prepare(source,mode,rid=prefs.room,optionCount=state(rid).optionCount){const q=clone(source);q.room=rid;q.kind=mode;q.chosen=null;q.ok=null;q.hint=false;q.timedOut=false;q.timerWarned=false;delete q.remainingMs;delete q.timeSpentMs;delete q.statsRecorded;
 if(mode==='B'){const sc=findScene(q.scene,q.rel,rid);q.cands=shuffle([{id:sc.id,correct:true},...shuffle(sc.decoys).slice(0,optionCount-1).map(id=>({id,correct:false}))]);delete q.options}
 else{const all=optionsFor(q,rid);q.options=shuffle([all.find(o=>o.rel===q.rel),...all.filter(o=>o.rel!==q.rel).slice(0,optionCount-1)]);delete q.cands}return q}
function makeRound(mode,retry=null,rid=prefs.room,retryLimit=null,retryOptions=null){
 const s=state(rid),rm=ROOMS[rid],seconds=retryLimit===null?s.timeLimit:retryLimit,optionCount=retryOptions===null?s.optionCount:retryOptions;
 if(retry)return initialiseTiming({mode,room:rid,filter:s.filter,optionCount,length:retry.length,i:0,retry:true,recorded:false,qs:shuffle(retry).map(q=>prepare(q,mode==='M'?q.kind:mode,rid,optionCount))},seconds);
 let rels=s.filter==='focus'?rm.focus:s.filter==='all'?rm.allowed:s.filter==='weak'?weakRelations(rid):[s.filter];if(!rels.length)rels=rm.focus;
 const sequence=[];while(sequence.length<s.length)sequence.push(...shuffle(rels));
 const used=new Set(),kinds=[];while(kinds.length<s.length)kinds.push(...shuffle(['A','B','C']));
 const qs=sequence.slice(0,s.length).map((rel,i)=>{const kind=mode==='M'?kinds[i]:mode;
  if(kind==='C'){let p=relevantBank(rid).filter(q=>q.rel===rel),fresh=p.filter(q=>!used.has(q.id));if(fresh.length)p=fresh;const q=pick(p);used.add(q.id);return prepare(q,kind,rid,optionCount)}
  let p=rm.scenes.filter(sc=>sc.rel===rel),fresh=p.filter(sc=>!used.has(sc.id+'/'+sc.rel));if(fresh.length)p=fresh;const sc=pick(p);used.add(sc.id+'/'+sc.rel);return prepare(sceneQuestion(sc,Math.floor(Math.random()*24),rid),kind,rid,optionCount)});
 return initialiseTiming({mode,room:rid,filter:s.filter,optionCount,length:s.length,i:0,retry:false,recorded:false,qs},seconds)}
function validRound(r,m,rid){try{
 if(!r||r.room!==rid||r.mode!==m||!allowedFilter(r.filter,rid)||!Array.isArray(r.qs)||!r.qs.length||r.qs.length>144||!Number.isInteger(r.i)||r.i<0||r.i>r.qs.length)return false;
 const limit=r.timeLimit===undefined?0:r.timeLimit;if(!TIME_LIMITS.includes(limit))return false;
 const count=r.optionCount===undefined?4:r.optionCount;if(![2,4].includes(count))return false;
 return r.qs.every(q=>{
  const kind=m==='M'?q.kind:m;if(!['A','B','C'].includes(kind))return false;
  if(!q||!ROOMS[rid].allowed.includes(q.rel)||!['head','tail','form','bo','ru'].every(k=>typeof q[k]==='string')||![null,-1,0,1,2,3].includes(q.chosen)||![null,true,false].includes(q.ok))return false;
  if(q.remainingMs!==undefined&&(!Number.isFinite(q.remainingMs)||q.remainingMs<0||q.remainingMs>limit*1000))return false;
  if(q.timeSpentMs!==undefined&&(!Number.isFinite(q.timeSpentMs)||q.timeSpentMs<0||q.timeSpentMs>limit*1000))return false;
  if(q.type!=='scene'||!findScene(q.scene,q.rel,rid)||!Array.isArray(q.words))return false;
  const a=kind==='B'?q.cands:q.options;if(!Array.isArray(a)||a.length!==count)return false;
  if(kind==='B'){if(a.filter(o=>o.correct).length!==1||!a.every(o=>ROOMS[rid].poses[o.id])||new Set(a.map(o=>o.id)).size!==count)return false}
  else if(a.filter(o=>o.rel===q.rel).length!==1||new Set(a.map(o=>o.rel)).size!==count||!a.every(o=>R[o.rel]&&R[o.rel].forms.includes(o.form)))return false;
  if(q.chosen===-1)return limit>0&&q.timedOut===true&&q.ok===false&&q.remainingMs===0;
  if(q.timedOut===true)return false;
  return q.chosen===null?q.ok===null:q.chosen<a.length&&q.ok===(kind==='B'?a[q.chosen].correct:a[q.chosen].rel===q.rel);
 });
 }catch(_){return false}}
for(const rid of Object.keys(ROOMS))for(const mode of ['A','B','C','M']){const r=state(rid).rounds[mode];migrateRound(r,mode,rid);if(!validRound(r,mode,rid))delete state(rid).rounds[mode];else{restoreTiming(r);r.qs.forEach(q=>recordQuestion(r,q));}}

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
    $('#liveStatus').textContent = 'Время вышло. Правильный ответ: ' + q.ru;
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
    mini.hidden = !show || questionMode(r,q) === 'C';
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
 $('#main').classList.remove('text-mode');
 $('#sceneHeading').textContent=m==='B'?'Найдите место для кошки':room().title;
 $('#sceneCaption').textContent=m==='B'?'Выберите один из пронумерованных вариантов для своего котика.':m==='C'?'Картинка и русская фраза описывают одно положение котика.':prefs.mode==='learn'?'Нажмите на послелог — кошка поменяет место.':'Посмотрите на кошку и выберите послелог.';
}
function bringQuestionIntoView(){if(prefs.mode!=='learn'&&matchMedia('(max-width:800px)').matches){$('#roundSettings').open=false;$('#main').scrollIntoView({behavior:'instant',block:'start'})}}
function renderCompanion(){const c=currentCat();$('#brandCat').src=c.src;$('#companionButton').innerHTML='<img src="'+c.src+'" alt=""/><span><small>Ваш спутник</small><strong>'+esc(c.name)+'</strong></span><span class="companion-change">Выбрать →</span>';}
function renderCats(){
 $('#catChoices').innerHTML=CATS.map(c=>'<button class="cat-choice" data-cat="'+c.id+'" aria-pressed="'+(prefs.cat===c.id)+'"><span class="cat-portrait"><img src="'+c.src+'" alt="" loading="lazy"/></span><span>'+esc(c.shortName||c.name)+'</span><i aria-hidden="true">'+(prefs.cat===c.id?'✓':'')+'</i></button>').join('');
}
function setCat(id){if(!CATS.some(c=>c.id===id))return;prefs.cat=id;refreshAllQuestions();save();$('#catsDialog').close();render(false);$('#liveStatus').textContent='Выбрана '+currentCat().ru+'. Картинка и предложения обновлены.';$('#companionButton').focus({preventScroll:true})}
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
 const ratio=matchMedia('(max-width:800px)').matches?1.3:1.65;let w=Math.max(rm.width*.32,x2-x1),h=Math.max(rm.height*.42,y2-y1);if(w/h>ratio)h=w/ratio;else w=h*ratio;
 if(w>rm.width){h*=rm.width/w;w=rm.width}if(h>rm.height){w*=rm.height/h;h=rm.height}
 return [Math.max(0,Math.min(rm.width-w,(x1+x2-w)/2)),Math.max(0,Math.min(rm.height-h,(y1+y2-h)/2)),w,h]}
function catSVG(p,animate,rid=prefs.room,staticImage=false){const rm=ROOMS[rid],h=p.width*currentCat().heightRatio,flip=p.flip?-1:1;const shadow=`<ellipse cx="${p.x+3}" cy="${p.y-1}" rx="${p.width*.33}" ry="${p.width*.045}" fill="#27170c" opacity=".3"/>`;
 const cat=`${shadow}<g transform="translate(${p.x} ${p.y}) scale(${flip} 1)"><g class="${animate?'appear':''}"><g class="${staticImage?'':'cat-idle'}"><image href="${currentCat().src}" x="${-p.width/2}" y="${-h}" width="${p.width}" height="${h}" preserveAspectRatio="xMidYMax meet"/></g></g></g>`;
 return cat+(p.mask||[]).map(id=>{const a=rm.occluders[id];if(!a)return'';const b=a.box;return `<image href="${a.uri}" x="${b[0]}" y="${b[1]}" width="${b[2]-b[0]}" height="${b[3]-b[1]}"/>`}).join('')}
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
 svg.innerHTML=`<image href="${rm.image}" x="0" y="0" width="${rm.width}" height="${rm.height}"/>`+cs.map(p=>catSVG(p,o.animate)).join('')+(o.cands&&o.chosen===null?`<g class="cat-previews">${o.cands.flatMap(cd=>rm.poses[cd.id]).map(p=>catSVG(p,false,prefs.room,true)).join('')}</g>`:'')+(prefs.labels?labelsSVG():'')+(o.cands?markerSVG(o,vb):'');
 $('.scene-wrap').style.aspectRatio=String(vb[2]/vb[3]);$('#labelsBtn').setAttribute('aria-pressed',String(prefs.labels));$('#zoomBtn').setAttribute('aria-pressed',String(prefs.zoom));$('#zoomBtn').setAttribute('aria-label',prefs.zoom?'Показать всю комнату':'Приблизить место задания');
 $('#landmarks').innerHTML='';$('#landmarks').hidden=true;
 $('#sceneCompanion').innerHTML='<img src="'+currentCat().src+'" alt=""/><span>'+esc(currentCat().name)+'</span>'}

// -------- Interface and existing exercise mechanics --------
const modeNames={learn:'Словарик',A:'Смотрим на картинку',B:'Находим нужное место',C:'Переводим с русского',M:'Смешанная тренировка'};
function cardTop(){return `<div class="card-top"><span class="kicker">${prefs.mode==='M'&&activeRound()?.qs[activeRound().i]?'Микс · '+modeNames[questionMode(activeRound())]:modeNames[prefs.mode]}</span><span class="level-pill">Уровень ${room().level}</span></div>`}
function sentenceHTML(q,answered){return `<p class="sentence bo" lang="bo">${esc(q.head)}${answered?`<mark>${esc(q.form)}</mark>`:'<span class="blank" aria-label="пропущенный послелог">?</span>'}${esc(q.tail)}</p>`}
function progressHTML(r){if(!r)return `<div class="learn-foot">${room().allowed.length} послелогов доступны в этой комнате</div>`;const solved=r.qs.filter(q=>q.chosen!==null).length,ok=r.qs.filter(q=>q.ok).length;
 return `<div class="progress"><div class="progress-meta"><span>${r.i<r.qs.length?'Вопрос '+(r.i+1)+' из '+r.qs.length:'Раунд завершён'}</span><span>Верно: ${ok} · Пройдено: ${solved}</span></div><div class="bars" aria-hidden="true">${r.qs.map((q,i)=>`<span class="bar ${q.ok===true?(q.hint?'help':'ok'):q.ok===false?'bad':i===r.i?'now':''}"></span>`).join('')}</div></div>`}
function currentLearn(){const s=state(),pool=room().scenes.filter(sc=>sc.rel===s.learnC);return sceneQuestion(pool[s.learnIndex%pool.length],s.learnIndex)}
function renderRooms(){$('#roomPicker').innerHTML=Object.entries(ROOMS).map(([id,rm])=>{const best=Object.values(state(id).best).filter(Number.isFinite),mark=best.length?Math.max(...best):null;return `<button class="room-choice" data-room="${id}" aria-pressed="${prefs.room===id}" aria-label="${rm.title}. Уровень ${rm.level}. ${rm.label}"><img src="${rm.thumbnail}" alt=""/><span class="room-choice-text"><span class="room-number">Уровень ${rm.level}${mark!==null?' · есть результат':''}</span><strong>${rm.title}</strong><span class="room-label">${rm.label}</span></span><span class="room-check" aria-hidden="true">${prefs.room===id?'✓':'→'}</span></button>`}).join('');
 $('#levelDescription').innerHTML=`<strong>${room().label}.</strong> ${esc(prefs.room==='bedroom'?'На, под, внутри и рядом. Только мебель этой комнаты и окрас вашего котика.':room().description)}${room().level>1?' <span class="review-note">Для повторения выберите «Все доступные».</span>':''}`}
function filterHTML(rid=prefs.room){const rm=ROOMS[rid];return `<option value="focus">${rm.level===1?'Послелоги этого уровня':'Новые послелоги уровня'}</option>${rm.level>1?'<option value="all">Все доступные</option>':''}`+'<option value="weak">Сложные для меня</option>'+rm.allowed.map(rel=>`<option value="${rel}">${R[rel].ru}</option>`).join('')}
function renderControls(){
 const s=state(),learn=prefs.mode==='learn',r=s.rounds[prefs.mode];
 $('#roundSettings').hidden=learn;$('#practiceControls').hidden=learn;
 $('#relationFilter').innerHTML=filterHTML();$('#relationFilter').value=s.filter;$('#roundLength').value=String(s.length);$('#timerSelect').value=String(s.timeLimit);$('#optionCount').value=String(s.optionCount);
 const pending=!learn&&r&&(r.filter!==s.filter||(!r.retry&&r.length!==s.length)||(r.timeLimit||0)!==s.timeLimit||(r.optionCount||4)!==s.optionCount);
 $('#settingsNote').hidden=!pending;$('#settingsNote').textContent=pending?'Настройки применятся к новому раунду. Текущее задание и оставшееся время сохранены.':'';
 $('#roundSettingsSummary').textContent=(r?.retry?'Повторение ошибок':(r?.length||s.length)+' вопросов')+' · '+(r?.optionCount||s.optionCount)+' варианта · '+((r?.timeLimit??s.timeLimit)?(r?.timeLimit??s.timeLimit)+' с на вопрос':'без таймера');
}

function renderDictionary(){const on=prefs.mode==='learn';$('#dictionary').hidden=!on;if(!on)return;const s=state();$('#dictionary').innerHTML=`<div class="section-head"><h2>Послелоги этой комнаты</h2><span class="aside">Нажмите — кошка покажет</span></div><div class="tiles">${room().allowed.map(rel=>`<button class="tile" data-rel="${rel}" aria-pressed="${s.learnC===rel}">${bo(R[rel].forms[0])}<span class="t-ru">${R[rel].ru}</span>${room().level>1&&room().focus.includes(rel)?'<span class="new-dot" title="Новый послелог уровня"></span>':''}</button>`).join('')}</div>`}
function pictureHTML(q){const rm=ROOMS[q.room];return `<svg class="example-picture" viewBox="0 0 ${rm.width} ${rm.height}" role="img" aria-label="${esc(q.ru)}"><image href="${rm.thumbnail}" width="${rm.width}" height="${rm.height}"/>${rm.poses[q.scene].map(p=>catSVG(p,false,q.room,true)).join('')}</svg>`}
function exampleCard(q,i,bank=false){return `<article class="example-card illustrated-example">${pictureHTML(q)}<div class="example-copy"><p class="example-index">${esc(ROOMS[q.room].title)} · ${R[q.rel].ru}</p><p class="ex-bo bo" lang="bo">${esc(q.head)}<mark>${esc(q.form)}</mark>${esc(q.tail)}</p><p class="ru">${esc(q.ru)}</p><div class="example-actions"><button class="text-link" data-example-id="${q.id}">Показать в комнате</button><button class="btn subtle" data-practice-id="${q.id}">Тренировать →</button></div></div></article>`}
function renderExamples(){const ar=activeRound(),pending=ar?.qs[ar.i]?.chosen===null;if(prefs.mode!=='learn'&&pending){$('#examples').hidden=true;return}$('#examples').hidden=false;const pool=relevantBank(),scenes=new Set(),ex=pool.filter(q=>{if(scenes.has(q.scene+'/'+q.rel))return false;scenes.add(q.scene+'/'+q.rel);return true}).slice(0,6);$('#examples').innerHTML=`<div class="section-head"><div><h2>Больше практики с вашим котиком</h2><p class="examples-intro">В этой комнате — ${phraseCount(pool.length)}. Откройте любую сцену или начните тренировку.</p></div><button class="text-link" data-action="open-bank">Все сцены и фразы →</button></div><div class="example-grid">${ex.map((q,i)=>exampleCard(q,i)).join('')}</div><div class="examples-footer"><button class="btn" data-action="open-bank">Все фразы с картинками · ${catBank().length} →</button></div>`;
 if(prefs.mode==='learn'&&room().objectColors){const colors=[...new Set(Object.values(room().refs).map(o=>o.color).filter(Boolean))];$('#examples').innerHTML+=`<div class="colors"><span class="color-heading">Цвета предметов в комнате</span>${colors.map(k=>`<span class="color-item"><i class="color-dot" style="--color:${COL[k].hex}"></i>${bo(COL[k].bo)}<span>${COL[k].ru}</span></span>`).join('')}</div>`}}
function renderLearn(animate=false){stopClock();updateTimerOverlay(null);$('#sceneTimer').hidden=true;const q=currentLearn(),r=R[q.rel];draw({id:q.scene,refs:q.refs,animate,alt:q.ru});$('#panel').innerHTML=cardTop()+`<div class="entry-heading">${bo(q.form)}<span class="entry-ru">${r.ru}</span></div>${r.forms.length>1?`<p class="variants bo" lang="bo">${r.forms.filter(f=>f!==q.form).map(esc).join(' · ')}</p>`:''}`+sentenceHTML(q,true)+`<p class="ru">${esc(q.ru)}</p>${wordsHTML(q)}${q.rel==='both'?'<p class="meaning-note">В этих заданиях «по обе стороны» показывают две кошки.</p>':''}${['left','right'].includes(q.rel)?'<p class="meaning-note">Слева и справа — со стороны зрителя.</p>':''}<div class="actions"><button class="btn" data-action="next-example">Другой пример ↻</button><button class="btn primary" data-action="practice-current">Потренироваться →</button></div>`+progressHTML();renderDictionary();renderExamples()}
function wordsHTML(q){return `<details class="sentence-words"><summary>Слова в предложении</summary><dl>${q.words.map(w=>`<div><dt>${w.cat?'<img src="'+currentCat().src+'" alt=""/>':''}${bo(w.bo)}</dt><dd>${esc(w.ru)}</dd></div>`).join('')}</dl><p>Нужно выбрать только послелог — слово, которое показывает положение кошки.</p></details>`}
function instructionHTML(m){return `<div class="mode-instruction"><strong>${m==='A'?'1. Посмотрите на котика':m==='B'?'1. Прочитайте тибетскую фразу':'1. Прочитайте фразу и посмотрите на котика'}</strong><span>${m==='B'?'2. Нажмите на нужный номер в комнате. Котик покажет ответ.':m==='C'?'2. Выберите послелог для пропуска «?». После ответа прочитайте целую фразу.':'2. Выберите послелог для пропуска «?». После ответа появится перевод.'}</span></div>`}
function renderGame(animate=false){const s=state();let r=s.rounds[prefs.mode];if(!r){r=s.rounds[prefs.mode]=makeRound(prefs.mode);save()}if(r.i>=r.qs.length){renderEnd(r);return}const q=r.qs[r.i],answered=q.chosen!==null,m=questionMode(r,q);configureScene(m);let h=cardTop()+timerHTML(r,q);
 draw({id:q.scene,refs:q.refs,show:m!=='B'||answered,cands:m==='B'?q.cands:null,chosen:q.chosen,animate,alt:m==='C'||answered||q.hint?q.ru:cap(currentCat().ru)+'. Определите её положение.'});
 h+=instructionHTML(m)+(m==='C'?`<p class="translation-prompt">${esc(q.ru)}</p>`:'')+sentenceHTML(q,answered||m==='B')+wordsHTML(q);
 if(m==='B')h+=`<div class="numbers" role="group" aria-label="Варианты мест">${q.cands.map((o,i)=>`<button class="place-number ${answered?(o.correct?'ok':q.chosen===i?'bad':''):''}" data-answer="${i}" ${answered?'disabled':''} aria-label="Место ${i+1}">${i+1}</button>`).join('')}</div>`;
 else h+=`<div class="options" role="group" aria-label="Варианты послелогов">${q.options.map((o,i)=>`<button class="option ${answered?(o.rel===q.rel?'ok':q.chosen===i?'bad':'dim'):''}" data-answer="${i}" ${answered?'disabled':''}><span class="number" aria-hidden="true">${i+1}</span>${bo(o.form)}${answered?`<span class="opt-ru">${o.rel===q.rel?'✓ ':q.chosen===i?'× ':''}${R[o.rel].ru}</span>`:''}</button>`).join('')}</div>`;
 if(answered)h+=`<p class="feedback ${q.ok?'good':'bad'}">${q.timedOut?(m==='B'?'Время вышло. Верное место — '+(q.cands.findIndex(c=>c.correct)+1)+'. Кошка показывает его.':'Время вышло. Правильно: '+bo(q.form)+' — '+R[q.rel].ru+'.'):q.ok?'✓ Верно'+(q.hint?' — с подсказкой.':'!'):m==='B'?'Не то место. Кошка показывает правильный ответ.':'Правильно: '+bo(q.form)+' — '+R[q.rel].ru+'.'}</p>${m!=='C'?`<p class="ru">${esc(q.ru)}</p>`:''}<div class="actions"><button class="btn primary" data-action="next">${r.i===r.qs.length-1?'Посмотреть результат':'Следующее задание'} →</button></div>`;
 else if(m!=='C')h+=q.hint?`<div class="hint-line"><p class="ru">${esc(q.ru)}</p><p class="small-note">Этот ответ учитывается как ответ с подсказкой.</p></div>`:'<div class="actions"><button class="btn" data-action="hint">Показать перевод</button></div>';
 $('#panel').innerHTML=h+progressHTML(r);renderDictionary();renderExamples();renderControls();renderCompanion();syncTimer(r)}
function recordKey(r){return r.mode+'-'+r.filter+'-'+r.length+(r.timeLimit?'-t'+r.timeLimit:'')+((r.optionCount||4)===2?'-a2':'')}
function renderEnd(r){configureScene('A');stopClock();updateTimerOverlay(null);$('#sceneTimer').hidden=true;const ok=r.qs.filter(q=>q.ok),solo=ok.filter(q=>!q.hint).length,wrong=r.qs.filter(q=>!q.ok),help=r.qs.filter(q=>q.hint).length,s=state(),key=recordKey(r);
 if(!r.recorded){if(!r.retry)s.best[key]=Math.max(+s.best[key]||0,solo);r.recorded=true;save();renderRooms()}
 draw({id:prefs.room==='bedroom'?'on_bed':'on_chair',refs:[],animate:false,alt:cap(currentCat().ru)+'. Раунд завершён.'});
 $('#panel').innerHTML=cardTop()+`<h2 class="result-title">Раунд завершён</h2>${timerResultHTML(r)}<p class="score"><strong>${ok.length}</strong> / ${r.qs.length}</p><p class="result-caption">${solo} верно без подсказки.${help?' Подсказка использована в '+help+' заданиях.':''}</p>${!r.retry?`<p class="small-note">Лучший результат в этой комнате ${r.timeLimit?'с таймером '+r.timeLimit+' с':'без таймера'}: ${s.best[key]||0} / ${r.qs.length} без подсказок.</p>`:''}${wrong.length?`<ul class="mistakes">${wrong.map(q=>`<li>${bo(q.bo)}<p class="ru">${esc(q.ru)}</p>${q.timedOut?'<span class="timeout-tag">Время вышло</span>':''}</li>`).join('')}</ul>`:'<p class="meaning-note">Ни одной ошибки. Отличная работа!</p>'}<div class="actions">${wrong.length?'<button class="btn primary" data-action="repeat-wrong">Повторить ошибки</button>':''}<button class="btn ${wrong.length?'':'primary'}" data-action="new-round">Ещё раунд ↻</button><button class="btn" data-action="learn">Словарик</button></div>`+progressHTML(r);renderDictionary();renderExamples();renderControls()}
function render(animate=false){renderCompanion();$('#main').classList.toggle('is-practice',prefs.mode!=='learn');renderRooms();$$('.tab').forEach(t=>{const active=t.dataset.mode===prefs.mode;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});$('#main').setAttribute('aria-labelledby','tab-'+prefs.mode);$('#main').classList.remove('text-mode');
 $('#sceneHeading').textContent=prefs.mode==='B'?'Найдите место для кошки':room().title;$('#sceneCaption').textContent=prefs.mode==='learn'?'Нажмите на послелог — кошка поменяет место.':prefs.mode==='B'?'Нажмите на номер в комнате или под предложением.':'Посмотрите на кошку и выберите послелог.';
 if(prefs.mode==='learn')renderLearn(animate);else renderGame(animate);renderControls();storageLabel()}
function setRoom(id){if(!ROOMS[id])return;if(id!==prefs.room)pauseTimer(false);prefs.room=id;save();render(false);$('#liveStatus').textContent='Открыта комната «'+room().title+'», уровень '+room().level+'.'}
function setMode(m){if(!['learn','A','B','C','M'].includes(m))return;if(m!==prefs.mode)pauseTimer(false);prefs.mode=m;save();render(false);bringQuestionIntoView()}
function newRound(){if(prefs.mode==='learn')return;stopClock();state().rounds[prefs.mode]=makeRound(prefs.mode);save();render(true);bringQuestionIntoView();$('#liveStatus').textContent='Начат новый раунд.'}
function answer(i){
 if(prefs.mode==='learn'||!Number.isInteger(i)||i<0)return;
 const r=state().rounds[prefs.mode];if(!r||r.i>=r.qs.length)return;
 const q=r.qs[r.i],opts=questionMode(r,q)==='B'?q.cands:q.options;
 if(q.chosen!==null||i>=opts.length||!timerCanAnswer(r))return;
 stopClock();
 if(r.timeLimit&&q.remainingMs<=0){finishTimeout(r);return}
 q.chosen=i;q.ok=questionMode(r,q)==='B'?opts[i].correct:opts[i].rel===q.rel;
 q.timedOut=false;q.timeSpentMs=r.timeLimit?r.timeLimit*1000-q.remainingMs:0;
 recordQuestion(r,q);save();renderGame(true);$('#liveStatus').textContent=(q.ok?'Верно. ':'Правильный ответ: ')+q.ru;
 $('#panel [data-action="next"]')?.focus({preventScroll:true});
}
function renderBank(){const all=catBank(),needle=$('#bankSearch').value.trim().toLocaleLowerCase('ru'),rel=$('#bankRel').value,rid=$('#bankLevel').value;const base=rid==='all'?all:relevantBank(rid);const qs=base.filter(q=>(rel==='all'||q.rel===rel)&&(!needle||[q.ru,q.bo].some(t=>t.toLocaleLowerCase('ru').includes(needle))));$('#bankCount').textContent=`Найдено фраз: ${qs.length}. Во всех комнатах — ${phraseCount(all.length)} и ${Object.values(ROOMS).reduce((n,rm)=>n+rm.scenes.length,0)} игровых ситуаций. Везде — ${currentCat().ru}.`;$('#bankGrid').innerHTML=qs.length?qs.map((q,i)=>exampleCard(q,i,true)).join(''):'<p class="empty">Таких фраз не нашлось. Попробуйте название предмета или другой послелог.</p>';$('#bankTitle').textContent='Сцены и фразы с вашим котиком';$('#bankLevel option[value="all"]').textContent='Все комнаты · '+phraseCount(all.length)}
function openBank(){pauseTimer(true);$('#bankSearch').value='';$('#bankRel').value='all';$('#bankLevel').value=prefs.room;renderBank();$('#bankDialog').showModal();$('#bankSearch').focus()}
function action(act){const s=state(),r=s.rounds[prefs.mode];
 if(act==='pause-timer'){pauseTimer(true);$('#timerResume')?.focus({preventScroll:true});$('#liveStatus').textContent='Пауза. Оставшееся время сохранено.'}
 else if(act==='resume-timer')resumeTimer();
 else if(act==='next-example'){s.learnIndex++;save();renderLearn(true)}
 else if(act==='practice-current'){s.filter=s.learnC;s.rounds.A=makeRound('A');setMode('A')}
 else if(act==='new-round')newRound();
 else if(act==='hint'){if(r&&r.i<r.qs.length&&r.qs[r.i].chosen===null&&timerCanAnswer(r)){r.qs[r.i].hint=true;save();renderGame(false);$('#liveStatus').textContent=r.qs[r.i].ru}}
 else if(act==='next'){if(r&&r.i<r.qs.length&&r.qs[r.i].chosen!==null){stopClock();r.paused=false;r.i++;save();renderGame(true);($('#panel [data-answer]')||$('#panel [data-action="repeat-wrong"]')||$('#panel [data-action="new-round"]'))?.focus({preventScroll:true})}}
 else if(act==='repeat-wrong'){if(r){const wrong=r.qs.filter(q=>q.ok===false);if(wrong.length){stopClock();s.rounds[prefs.mode]=makeRound(prefs.mode,wrong,prefs.room,r.timeLimit,r.optionCount||4);s.rounds[prefs.mode].filter=r.filter;save();renderGame(true)}}}
 else if(act==='open-cats'){pauseTimer(true);renderCats();$('#catsDialog').showModal()}else if(act==='close-cats')$('#catsDialog').close();else if(act==='open-progress'){pauseTimer(true);renderProgress();$('#progressDialog').showModal()}else if(act==='close-progress')$('#progressDialog').close();else if(act==='practice-weak')practiceWeak();else if(act==='learn')setMode('learn');else if(act==='open-bank')openBank();else if(act==='close-bank')$('#bankDialog').close();else if(act==='sources'){pauseTimer(true);$('#sourceDialog').showModal();}else if(act==='close-sources')$('#sourceDialog').close();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.cat)return setCat(b.dataset.cat);if(b.dataset.room)return setRoom(b.dataset.room);if(b.dataset.mode)return setMode(b.dataset.mode);if(b.dataset.rel){state().learnC=b.dataset.rel;state().learnIndex=0;save();renderLearn(true);return}if(b.dataset.answer!==undefined)return answer(+b.dataset.answer);if(b.dataset.practiceId){practiceSentence(b.dataset.practiceId);return}if(b.dataset.exampleId){showExample(b.dataset.exampleId);return}if(b.dataset.action)action(b.dataset.action)});
$('#labelsBtn').addEventListener('click',()=>{prefs.labels=!prefs.labels;save();if(lastDraw)draw({...lastDraw,animate:false})});$('#zoomBtn').addEventListener('click',()=>{prefs.zoom=!prefs.zoom;save();if(lastDraw)draw({...lastDraw,animate:false})});
$('#relationFilter').addEventListener('change',e=>{state().filter=e.target.value;save();renderControls()});$('#roundLength').addEventListener('change',e=>{state().length=+e.target.value;save();renderControls()});
$('#optionCount').addEventListener('change',e=>{if([2,4].includes(+e.target.value))state().optionCount=+e.target.value;save();renderControls()});
$('#timerSelect').addEventListener('change',e=>{const value=Number(e.target.value);if(TIME_LIMITS.includes(value))state().timeLimit=value;save();renderControls()});
$('#scene').addEventListener('click',e=>{const el=e.target.closest('[data-spot]');if(el&&!el.classList.contains('wrong'))answer(+el.dataset.spot)});
$('#scene').addEventListener('keydown',e=>{const el=e.target.closest('[data-spot]');if(el&&['Enter',' '].includes(e.key)){e.preventDefault();answer(+el.dataset.spot)}});
$('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const ts=$$('.tab'),i=ts.findIndex(t=>t.dataset.mode===prefs.mode),j=e.key==='Home'?0:e.key==='End'?ts.length-1:(i+(e.key==='ArrowRight'?1:-1)+ts.length)%ts.length;setMode(ts[j].dataset.mode);ts[j].focus()});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||prefs.mode==='learn'||$('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable]'))return;if(/^[1-4]$/.test(e.key)){e.preventDefault();answer(+e.key-1)}});
$('#bankSearch').addEventListener('input',renderBank);$('#bankRel').addEventListener('change',renderBank);$('#bankLevel').addEventListener('change',renderBank);
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeToken);resizeToken=requestAnimationFrame(()=>{if(lastDraw&&!$('#main').classList.contains('text-mode'))draw({...lastDraw,animate:false})})});
$('#bankRel').innerHTML='<option value="all">Все послелоги</option>'+Object.keys(R).map(k=>`<option value="${k}">${R[k].ru}</option>`).join('');
$('#brandCat').src=currentCat().src;
if(matchMedia('(max-width:800px)').matches)$('#roundSettings').open=false;
window.__ZHIMI={version:'7.0',pauseTimer,resumeTimer,syncTimer,tickTimer,recordKey,prefs,ROOMS,R,catBank,makeRound,prepare,questionMode,CATS,currentCat,recordQuestion,weakRelations,setCat,practiceSentence,sceneQuestion,draw,answer,action,render,mode:setMode,setRoom,state,validRound,relevantBank,
 qa:()=>({version:'7.0',timeLimits:TIME_LIMITS,rooms:Object.keys(ROOMS).length,sentences:catBank().length,uniqueSentences:new Set(catBank().map(q=>q.bo)).size,scenes:Object.fromEntries(Object.entries(ROOMS).map(([id,r])=>[id,r.scenes.length])),levelBankCounts:Object.fromEntries(Object.keys(ROOMS).map(id=>[id,relevantBank(id).length]))})};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseTimer(true);else if(prefs.mode!=='learn'){updateTimer();updateTimerOverlay();}});
window.addEventListener('pagehide',()=>{pauseTimer(false);save();});
window.addEventListener('pageshow',e=>{if(e.persisted){if(prefs.mode!=='learn')syncTimer();else updateTimerOverlay(null);}});
render(false);save();
})();
