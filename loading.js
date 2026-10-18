/* A real resource-progress loader with a playful painted cat. */
(()=>{'use strict';
const overlay=document.getElementById('gameLoading');if(!overlay)return;
const title=document.getElementById('loadingTitle'),caption=document.getElementById('loadingCaption'),number=document.getElementById('loadingPercent'),bar=document.getElementById('loadingProgress'),retry=document.getElementById('loadingRetry');
const bootCaptions=['Зовём котиков…','Распутываем клубок…','Ищем самое уютное местечко…','Устраиваемся поудобнее…','Гладим котиков за ушком…'];
const sceneCaptions=['Зовём котика на прогулку…','Разворачиваем красивую картинку…','Разминаем мягкие лапки…','Гладим котика за ушком…'];
let active=null,serial=0,showTimer=0,hideTimer=0,bootStarted=false;
function busy(value){const app=document.getElementById('app');if(app){app.inert=value;app.setAttribute('aria-busy',String(value));}document.documentElement.classList.toggle('game-loading-active',value);}
function display(job){if(active!==job||job.finished)return;overlay.hidden=false;overlay.classList.remove('is-complete','is-error');retry.hidden=true;busy(true);paint(job);}
function paint(job){if(active!==job)return;const percent=Math.round(Math.min(job.done,job.total)/job.total*100),lines=job.kind==='boot'?bootCaptions:sceneCaptions,index=Math.min(lines.length-1,Math.floor(percent/100*lines.length));
 title.textContent=job.kind==='boot'?'Готовим игру':'Готовим сценку';caption.textContent=percent===100?'Котик готов. Можно играть!':lines[index];number.textContent=percent+'%';bar.setAttribute('aria-valuenow',String(percent));bar.style.setProperty('--loaded',percent+'%');}
function begin(kind,total,delay=0){clearTimeout(showTimer);clearTimeout(hideTimer);const job={id:++serial,kind,total:Math.max(1,total),done:0,finished:false};active=job;
 if(delay&&overlay.hidden)showTimer=setTimeout(()=>display(job),delay);else display(job);
 return {step(){if(active!==job||job.finished)return;job.done=Math.min(job.total,job.done+1);paint(job);},finish(){if(active!==job||job.finished)return;job.finished=true;clearTimeout(showTimer);job.done=job.total;paint(job);if(overlay.hidden){active=null;return;}overlay.classList.add('is-complete');hideTimer=setTimeout(()=>{if(active!==job)return;overlay.hidden=true;overlay.classList.remove('is-complete');busy(false);active=null;},180);},cancel(){if(active!==job)return;clearTimeout(showTimer);clearTimeout(hideTimer);overlay.hidden=true;overlay.classList.remove('is-complete');busy(false);active=null;},fail(){if(active!==job)return;clearTimeout(showTimer);clearTimeout(hideTimer);job.finished=true;overlay.hidden=false;overlay.classList.remove('is-complete');overlay.classList.add('is-error');busy(true);title.textContent='Котик немного задержался';caption.textContent='Не удалось загрузить игру. Попробуем ещё раз?';retry.hidden=false;}};
}
const boot=begin('boot',12);
const sources=['game-cover.webp?v=10.1.0','cat-gray.webp','cat-ginger.webp','cat-black.webp','cat-white.webp','cat-gray-white.webp','cat-calico.webp','cat-brown-white.webp','story-bridge.webp?v=10.0.2','loader-cat-yarn.webp?v=10.1.0'];
function imageReady(src){return new Promise((resolve,reject)=>{const image=new Image();let settled=false;const finish=ok=>{if(settled)return;settled=true;clearTimeout(timeout);if(ok)resolve();else reject(new Error('image-load'));};const timeout=setTimeout(()=>finish(false),20000);image.onload=()=>finish(true);image.onerror=()=>finish(false);image.src=src;if(image.complete&&image.naturalWidth)finish(true);});}
const imagesReady=Promise.all(sources.map(src=>imageReady(src).then(()=>boot.step()))).catch(()=>boot.fail());
function ready(){if(bootStarted)return;bootStarted=true;busy(true);boot.step();const fonts=document.fonts?.ready||Promise.resolve();let fontTimer;const fallback=new Promise(resolve=>{fontTimer=setTimeout(resolve,2500);});const textReady=Promise.race([fonts,fallback]).then(()=>{clearTimeout(fontTimer);boot.step();});Promise.all([imagesReady,textReady]).then(()=>boot.finish());}
retry.addEventListener('click',()=>location.reload());
window.addEventListener('error',event=>{if(event.target?.tagName==='SCRIPT')boot.fail();},true);
window.GAME_LOADER={ready,scene:total=>begin('scene',total,140),fail:()=>boot.fail()};
})();
