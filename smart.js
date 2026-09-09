/* Wealth Arrays Smart Assistant — stable local response layer */
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function ensure(){
 var root=document.querySelector('.calc-widget')||document.getElementById('calc-widget'); if(!root)return null;
 var box=document.getElementById('wa-smart');
 if(!box){box=document.createElement('section');box.id='wa-smart';box.className='wa-smart';
 box.innerHTML='<div class="wa-smart-head"><strong>Smart Calculator Assistant</strong><span>LOCAL</span></div><div class="wa-smart-body"><div id="wa-smart-live"><div class="wa-smart-card"><b>Ask about your result</b><p>Try: What does this result mean?</p></div></div><div class="wa-smart-ask"><input id="wa-smart-question" placeholder="Ask about your result"><button type="button" id="wa-smart-ask">Explain</button><button type="button" id="wa-smart-voice" aria-label="Ask by voice">🎙</button></div></div>';
 root.appendChild(box);} return box;
}
function rows(){return Array.prototype.slice.call(document.querySelectorAll('.calc-result-row')).map(function(r){return {label:(r.querySelector('.calc-result-label')||{}).textContent||'',value:(r.querySelector('.calc-result-value')||{}).textContent||''};});}
function answer(q){
 var x=String(q||'').trim().toLowerCase(),r=rows(),first=r[0];
 if(!x)return 'Type or say a question. For example: What does this result mean?';
 if(!r.length)return 'First enter your numbers and press Calculate my result. Then I can explain the result.';
 if(x.indexOf('interest')>-1)return 'Interest is the extra money earned on a deposit or investment, or the extra cost paid for borrowing money. Check the result rows to see which applies here.';
 if(x.indexOf('risk')>-1||x.indexOf('safe')>-1)return 'This calculator gives an estimate, not a guarantee. Test conservative assumptions before making a financial decision.';
 if(x.indexOf('more')>-1||x.indexOf('change')>-1||x.indexOf('scenario')>-1)return 'Change one input at a time, then calculate again. This is the clearest way to see what actually affects your result.';
 return 'Your main result is '+first.label.trim()+': '+first.value.trim()+'. This is based on the numbers you entered. Check the other rows for the breakdown.';
}
function show(q){ensure();var out=document.getElementById('wa-smart-live');if(out)out.innerHTML='<div class="wa-smart-card"><b>Assistant answer</b><p>'+esc(answer(q))+'</p></div>';}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#wa-smart-ask');if(b){e.preventDefault();var i=document.getElementById('wa-smart-question');show(i?i.value:'');}},true);
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&e.target.id==='wa-smart-question'){e.preventDefault();show(e.target.value);}},true);
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#wa-smart-voice');if(!b)return;var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){show('Voice input is not supported in this browser.');return;}var rec=new SR();rec.lang='en-IN';rec.interimResults=false;rec.maxAlternatives=1;rec.onresult=function(ev){var t=ev.results[0][0].transcript;var i=document.getElementById('wa-smart-question');if(i)i.value=t;show(t);};rec.onerror=function(){show('Voice could not be understood. Please try again or type your question.');};rec.start();},true);
window.addEventListener('load',ensure);document.addEventListener('DOMContentLoaded',ensure);
})();